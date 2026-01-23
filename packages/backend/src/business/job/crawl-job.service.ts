import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateJobDto, UserInfoFromToken } from '@prisma-ai/shared';
import { Model } from 'mongoose';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ChainService } from '../../chain/chain.service';
import { TaskQueueService } from '../../task-queue/task-queue.service';
import { PersistentTask } from '../../type/taskqueue';
import { StartCrawlDto } from './dto/start-crawl.dto';
import { Job, JobDocument } from './entities/job.entity';

puppeteer.use(StealthPlugin());

interface CrawlTask extends PersistentTask {
	metadata: {
		options: StartCrawlDto;
		completedCount: number; //当前任务已爬取数量(去重后)
	};
}
//延迟伪装配置
const delayConfig = {
	//列表页延迟
	list: {
		minDelay: 0,
		maxDelay: 500
	},
	//详情页延迟
	detail: {
		minDelay: 0,
		maxDelay: 1000
	},
	//滚动延迟
	scroll: {
		minDelay: 0,
		maxDelay: 500
	}
};

const dataLoadTimeout = 5 * 1000; //ms

/**
 * 爬取职位信息的爬虫
 * 爬虫功能：
 * 1. 使用llm扩展query关键词
 * 2. 使用爬虫爬取职位信息(过滤掉已存在的职位)
 * 爬虫伪装：
 * 1. 设置访问频率伪装(不同页面设置不同的访问频率伪装)
 * 2. 使用正态分布的随机延迟，模拟真实用户行为
 * 3. 模拟真实用户行为(滚动、鼠标移动)
 */
@Injectable()
export class CrawlJobService {
	// 日志记录器
	private readonly logger = new Logger(CrawlJobService.name);
	@InjectModel(Job.name) private jobModel: Model<JobDocument>;
	taskType = 'crawl-job';

	//爬取到的岗位数据用户间共享,人岗匹配后用户可将公共岗位数据转为自己的岗位数据
	userInfoSpider = {
		userId: 'system',
		username: '系统爬虫'
	};

	constructor(
		private readonly taskQueueService: TaskQueueService,
		private readonly chainService: ChainService
	) {
		try {
			this.taskQueueService.registerTaskHandler(this.taskType, this._taskHandler.bind(this));
		} catch (error) {
			this.logger.error(`爬虫任务处理器${this.taskType}注册失败: ${error}`);
			throw error;
		}
		this.logger.log(`爬虫任务处理器已注册: ${this.taskType}`);
	}

	private async _taskHandler(task: CrawlTask): Promise<void> {
		const { metadata } = task;
		const { options } = metadata;

		const { browser, page } = await this._initializeBrowser();

		try {
			if (Array.isArray(options.query)) {
				for (const query of options.query) {
					// 每次循环重新获取任务状态，确保获取最新的 completedCount
					const curTask = await this.taskQueueService.getTask<CrawlTask>(task.id);
					if (!curTask) {
						this.logger.error(`获取任务失败: ${task.id}`);
						break;
					}
					const {
						metadata: { completedCount: curCompletedCount }
					} = curTask;

					if (curCompletedCount >= options.totalCount) {
						this.logger.log(
							`当前任务已爬取数量: ${curCompletedCount} 已达到目标数量: ${options.totalCount},任务结束`
						);
						break;
					}

					this.logger.log(`开始处理查询词: ${query}`);
					await this._startSpider({ ...options, query }, task, page);
				}
			} else {
				await this._startSpider({ ...options }, task, page);
			}
		} catch (error) {
			this.logger.error('任务执行过程中发生错误:', error);
			throw error;
		} finally {
			await browser.close();
			this.logger.log('浏览器已关闭');
		}
	}

	/**
	 * 传入query数组,则每个query都爬取一次,否则只爬取一次
	 * @description 某直聘的一个query能获取的职位数量有限(82/300),所以需要使用多个query多次爬取
	 */
	async startCrawlTask(options: StartCrawlDto, userInfo: UserInfoFromToken) {
		/* 使用llm扩展query关键词 */
		if (!Array.isArray(options.query)) {
			const queryExpandChain = await this.chainService.queryExpandChain(userInfo.userConfig!);
			const queryExpand = await queryExpandChain.invoke({
				input: options.query
			});
			options.query = queryExpand;
		}
		const sessionId = crypto.randomUUID();
		const task = await this.taskQueueService.createAndEnqueueTask(
			sessionId,
			this.userInfoSpider.userId,
			this.taskType,
			{ options, completedCount: 0 }
		);
		return task;
	}

	/**
	 * 主入口：启动爬虫，并根据提供的参数抓取职位信息
	 * @param options 爬虫启动参数
	 * @param page Puppeteer 页面实例
	 * @returns 返回一个包含成功信息和保存数量的对象
	 */
	private async _startSpider(options: StartCrawlDto, task: CrawlTask, page: Page) {
		const { totalCount, city, query, industry, position, maxRetries = 7 } = options;
		const listPageUrl = `https://m.zhipin.com/${city}/?query=${query}&industry=${
			industry || ''
		}&position=${position || ''}`;

		this.logger.log(`开始爬取目标URL: ${listPageUrl}`);
		this.logger.log(`目标新增数据总数：${totalCount}`);
		this.logger.log(`当前已新增的数据总数: ${task?.metadata?.completedCount ?? '未知'}`);

		try {
			// 1. 收集所有职位详情页的链接
			const jobLinks = await this._getJobLinks(page, listPageUrl, totalCount, maxRetries);
			this.logger.log(`成功收集到 ${jobLinks.length} 个职位链接`);

			// 2. 遍历链接，抓取职位详情
			const allJobs: CreateJobDto[] = [];
			for (let i = 0; i < jobLinks.length; i++) {
				const link = jobLinks[i];
				this.logger.log(`正在抓取第 ${i + 1} / ${jobLinks.length} 个职位: ${link}`);
				const jobDetail = await this._getJobDetails(page, link, maxRetries);
				if (jobDetail) {
					allJobs.push(jobDetail);
				}
			}

			// 3. 将抓取到的职位信息存入数据库
			const savedCount = await this._saveJobs(allJobs, task);
			this.logger.log(`爬虫任务完成，成功保存了 ${savedCount} 条新的职位信息。`);

			return { message: '爬虫任务完成', savedCount };
		} catch (error) {
			this.logger.error('爬虫执行过程中发生错误:', error);
			throw error;
		}
	}

	/**
	 * 初始化 Puppeteer 浏览器和页面实例
	 * @returns 返回浏览器和页面实例
	 */
	private async _initializeBrowser(): Promise<{
		browser: Browser;
		page: Page;
	}> {
		this.logger.log('正在初始化浏览器...');
		const browserWSEndpoint = process.env.PUPPETEER_BROWSER_WSE_ENDPOINT;
		let browser: Browser;

		if (browserWSEndpoint) {
			// 如果配置了远程端点，则连接到远程浏览器
			this.logger.log(`正在连接到远程浏览器: ${browserWSEndpoint}`);
			try {
				browser = (await puppeteer.connect({
					browserWSEndpoint,
					// 传递一些与本地启动时相同的参数，以确保行为一致
					defaultViewport: {
						width: 1366,
						height: 768
					}
				})) as unknown as Browser;
				this.logger.log('成功连接到远程浏览器。');
			} catch (error) {
				this.logger.error(`连接到远程浏览器失败: ${error.message}`, error.stack);
				throw new Error('无法连接到远程浏览器服务');
			}
		} else {
			// 否则，启动本地 Puppeteer 实例
			this.logger.log('未检测到远程浏览器端点，将启动本地 Puppeteer 实例。');
			browser = (await puppeteer.launch({
				headless: false, // 在本地可以设置为 'new' 或 false 进行调试
				defaultViewport: {
					width: 1366, // 设置常见的屏幕分辨率
					height: 768
				},
				args: [
					'--no-sandbox', // Docker/CI 环境必须
					'--disable-setuid-sandbox', // Docker/CI 环境必须
					'--disable-dev-shm-usage', // 防止内存溢出
					'--disable-web-security', // 允许跨域等（功能性需求）
					'--disable-features=VizDisplayCompositor'
					// '--disable-blink-features=AutomationControlled' // 移除：完全交给 StealthPlugin 处理
				]
			})) as unknown as Browser;
			this.logger.log('本地 Puppeteer 实例启动成功。');
		}

		// 启用 Stealth 插件后，它会自动处理 User-Agent、webdriver、chrome 属性等指纹
		// 手动设置可能会覆盖插件的优化配置，甚至引入特征矛盾
		// 因此移除手动的 User-Agent 和 Header 设置，完全信任插件

		//会导致认证页面加载不出来,无法手动验证,所以暂时注释掉
		// 过滤掉图片、样式、字体、媒体等资源的请求,阻止加载不必要的资源以提高速度
		/*     await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    }); */

		const page = await browser.newPage();

		// 注入脚本以绕过历史记录回退防御
		await page.evaluateOnNewDocument(() => {
			try {
				// 1. 覆盖 history.back
				Object.defineProperty(history, 'back', {
					value: function () {
						console.log('Anti-crawler bypass: Blocked history.back()');
						return; // 不执行任何操作
					},
					writable: false,
					configurable: false
				});

				// 2. 覆盖 history.go，防止负向导航
				const originalGo = history.go;
				Object.defineProperty(history, 'go', {
					value: function (delta?: number) {
						if (delta && delta < 0) {
							console.log(`Anti-crawler bypass: Blocked history.go(${delta})`);
							return;
						}
						// 确保 arguments 类型正确传递
						return originalGo.apply(this, arguments as any);
					},
					writable: false,
					configurable: false
				});

				// 3. 拦截 popstate 事件监听 (防止网站通过监听历史记录变化来触发防御逻辑)
				const originalAddEventListener = window.addEventListener;
				window.addEventListener = function (type, listener, options) {
					if (type === 'popstate') {
						console.log(
							'Anti-crawler bypass: Blocked popstate listener registration via addEventListener'
						);
						return;
					}
					return originalAddEventListener.apply(this, arguments as any);
				};

				// 4. 拦截 window.onpopstate 赋值
				Object.defineProperty(window, 'onpopstate', {
					set: function (val) {
						console.log('Anti-crawler bypass: Blocked window.onpopstate assignment');
					},
					get: function () {
						return null;
					},
					configurable: false
				});

				// 5. 在捕获阶段拦截 popstate 事件，防止其传播到任何已存在的监听器
				originalAddEventListener.call(
					window,
					'popstate',
					e => {
						console.log('Anti-crawler bypass: Stopped popstate event propagation');
						e.stopImmediatePropagation();
						e.preventDefault();
					},
					true // useCapture = true
				);
			} catch (e) {
				console.error('Failed to inject history bypass:', e);
			}
		});

		// 监控响应状态
		page.on('response', response => {
			if (response.status() === 429) {
				this.logger.warn('检测到频率限制响应 (429)，需要增加延迟');
			} else if (response.status() >= 400) {
				this.logger.warn(`检测到异常响应: ${response.status()} - ${response.url()}`);
			}
		});

		this.logger.log('浏览器初始化完成');
		return { browser, page };
	}

	/**
	 * 从列表页收集所有职位详情页的链接
	 * @param page - Puppeteer 页面对象
	 * @param listPageUrl - 职位列表页的 URL
	 * @param totalCount - 要收集的链接总数
	 * @param maxRetries - 最大重试次数
	 * @returns 职位详情页链接数组
	 */
	private async _getJobLinks(
		page: Page,
		listPageUrl: string,
		totalCount: number,
		maxRetries: number
	): Promise<string[]> {
		let retries = 0;
		let lastError: any;

		while (retries <= maxRetries) {
			try {
				if (retries > 0) {
					this.logger.log(
						`正在重试访问职位列表页 (第 ${retries}/${maxRetries} 次): ${listPageUrl}`
					);
				} else {
					this.logger.log(`正在访问职位列表页: ${listPageUrl}`);
				}

				// 添加访问频率伪装
				await this._simulateHumanBehavior('list');

				await page.goto(listPageUrl, { waitUntil: 'networkidle2' }); // 等待网络空闲

				// 确认页面是否正常加载了内容
				await page.waitForSelector('.job-list-new .item', { timeout: dataLoadTimeout });

				await this._scrollAndLoadJobs(page, totalCount);

				this.logger.log('开始从页面提取职位链接...');
				const links = await page.$$eval('.job-list-new .item a', anchors =>
					anchors.map(a => `https://m.zhipin.com${a.getAttribute('href')}`)
				);

				// 去重并截取到目标数量
				const uniqueLinks = [...new Set(links)];
				return uniqueLinks.slice(0, totalCount);
			} catch (error) {
				lastError = error;
				retries++;
				this.logger.warn(`获取职位列表失败: ${error.message}`);

				if (retries > maxRetries) {
					break;
				}

				this.logger.log('等待一段时间后重试...');
				await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
			}
		}

		this.logger.error(`多次尝试获取职位列表失败，已达到最大重试次数 ${maxRetries}`);
		throw lastError;
	}

	/**
	 * 滚动页面以加载足够数量的职位
	 * @param page - Puppeteer 页面对象
	 * @param totalCount - 目标加载的职位总数
	 */
	private async _scrollAndLoadJobs(page: Page, totalCount: number): Promise<void> {
		this.logger.log(`开始滚动页面，目标加载 ${totalCount} 个职位...`);
		let currentJobCount = 0;
		let previousJobCount = 0;
		let retries = 0;
		const maxRetries = 3; // 如果滚动后数量没有变化，最多重试次数

		while (currentJobCount < totalCount) {
			currentJobCount = await page.$$eval('.job-list-new .item', items => items.length);
			this.logger.log(`当前已加载 ${currentJobCount} 个职位`);

			if (currentJobCount >= totalCount) {
				break;
			}

			const hasLoadMore = await page.$('.loadmore[data-hasmore="true"]');
			if (!hasLoadMore) {
				this.logger.log('没有更多职位可以加载了。');
				break;
			}

			// 滚动到页面底部
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

			// 添加滚动后的延迟
			await this._simulateHumanBehavior('scroll');

			// 等待新内容加载
			try {
				// 等待职位数量增加
				await page.waitForFunction(
					(selector, prevCount) => {
						const currentCount = document.querySelectorAll(selector).length;
						return currentCount > prevCount;
					},
					{ timeout: dataLoadTimeout },
					'.job-list-new .item',
					currentJobCount
				);
			} catch (error) {
				this.logger.warn('滚动后10秒内职位数量未增加，可能已到底部或加载缓慢。');
				retries++;
				if (retries > maxRetries) {
					this.logger.error('多次尝试滚动加载失败，终止滚动。');
					break;
				}
				continue;
			}
			previousJobCount = currentJobCount;
			if (previousJobCount === (await page.$$eval('.job-list-new .item', items => items.length))) {
				this.logger.log('滚动后职位数量没有变化，结束滚动。');
				break;
			}
		}
	}

	/**
	 * 抓取单个职位详情页的信息
	 * @param page - Puppeteer 页面对象
	 * @param jobLink - 职位详情页链接
	 * @param maxRetries - 最大重试次数
	 * @returns 格式化后的职位数据，如果抓取失败则返回 null
	 */
	private async _getJobDetails(
		page: Page,
		jobLink: string,
		maxRetries: number
	): Promise<CreateJobDto | null> {
		let retries = 0;

		while (retries <= maxRetries) {
			try {
				if (retries > 0) {
					this.logger.debug(`正在重试抓取职位详情 (第 ${retries}/${maxRetries} 次): ${jobLink}`);
				}

				// 访问频率伪装
				await this._simulateHumanBehavior('detail');

				await page.goto(jobLink, { waitUntil: 'networkidle2' });
				await page.waitForSelector('.job-sec', { timeout: dataLoadTimeout });

				// 添加用户交互模拟
				await this._simulateUserInteraction(page);

				const jobDetails: CreateJobDto = await page.evaluate(link => {
					const getText = (selector: string) => {
						const element = document.querySelector(selector);
						// 明确处理元素不存在的情况
						return element ? element.textContent?.trim() || '' : '';
					};

					// 从HTML中提取描述并处理<br>标签
					const getDescription = () => {
						const descriptionEl = document.querySelector('.job-sec .text');
						if (!descriptionEl) return '';
						return descriptionEl.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
					};

					return {
						jobName: getText('.job-banner .job-title'),
						companyName: getText('.job-company .info-primary .name'),
						description: getDescription(),
						location: getText('.job-banner p a.text-city'),
						salary: getText('.job-banner .salary'),
						link: link
					};
				}, jobLink);

				// 简单的验证，确保关键信息存在
				if (!jobDetails.jobName || !jobDetails.companyName) {
					this.logger.warn(`职位链接 ${jobLink} 缺少关键信息，已跳过。`);
					return null;
				}

				return jobDetails;
			} catch (error) {
				retries++;
				this.logger.warn(`抓取职位详情失败: ${jobLink} - ${error.message}`);

				if (retries > maxRetries) {
					this.logger.error(`抓取职位详情最终失败，跳过: ${jobLink}`);
					return null;
				}

				await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
			}
		}
		return null;
	}

	/**
	 * 批量保存职位信息到数据库，并过滤掉已存在的职位
	 * @param jobs - 待保存的职位信息数组
	 * @returns 返回实际新保存的职位数量
	 */
	private async _saveJobs(jobs: CreateJobDto[], task: CrawlTask): Promise<number> {
		if (jobs.length === 0) {
			this.logger.log('没有新的职位信息需要保存。');
			return 0;
		}
		this.logger.log(`准备保存 ${jobs.length} 条职位信息到数据库...`);

		const jobLinks = jobs.map(j => j.link);

		// 1. 查找数据库中已经存在的链接
		const existingJobs = await this.jobModel
			.find({ link: { $in: jobLinks } })
			.select('link')
			.lean();
		const existingLinks = new Set(existingJobs.map(j => j.link));
		this.logger.log(`数据库中已存在 ${existingLinks.size} 条职位。`);

		// 2. 过滤掉已经存在的职位
		const newJobs = jobs.filter(j => !existingLinks.has(j.link));
		this.logger.log(`过滤后，有 ${newJobs.length} 条新的职位信息需要插入。`);
		task.metadata.completedCount += newJobs.length;
		await this.taskQueueService.saveTask(task);
		// 3. 插入新的职位信息
		if (newJobs.length > 0) {
			await this.jobModel.insertMany(newJobs.map(j => ({ ...j, userInfo: this.userInfoSpider })));
			this.logger.log('新的职位信息已成功存入数据库。');
		}

		return newJobs.length;
	}

	/**
	 * 不同页面设置不同的访问频率伪装
	 * @param pageType 页面类型，用于区分不同类型页面的访问延迟
	 */
	private async _simulateHumanBehavior(
		pageType: 'list' | 'detail' | 'scroll' = 'detail'
	): Promise<void> {
		let minDelay: number;
		let maxDelay: number;

		switch (pageType) {
			case 'list':
				minDelay = delayConfig.list.minDelay; // 列表页延迟 0-0.5 秒
				maxDelay = delayConfig.list.maxDelay;
				break;
			case 'detail':
				minDelay = delayConfig.detail.minDelay; // 详情页延迟 0-1 秒
				maxDelay = delayConfig.detail.maxDelay;
				break;
			case 'scroll':
				minDelay = delayConfig.scroll.minDelay; // 滚动延迟 0-0.5 秒
				maxDelay = delayConfig.scroll.maxDelay;
				break;
		}

		// 使用正态分布式的随机延迟，更符合人类行为
		const delay = this._generateNormalDistributionDelay(minDelay, maxDelay);
		this.logger.debug(`${pageType} 页面访问延迟伪装: ${delay}ms`);
		await new Promise(resolve => setTimeout(resolve, delay));
	}

	/**
	 * 生成正态分布的延迟时间，模拟真实用户行为
	 */
	private _generateNormalDistributionDelay(min: number, max: number): number {
		// 使用 Box-Muller 变换生成正态分布
		const u1 = Math.random();
		const u2 = Math.random();
		const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

		// 将正态分布映射到指定范围
		const mean = (min + max) / 2;
		const stdDev = (max - min) / 6; // 99.7% 的值在 3 个标准差内
		let delay = mean + z0 * stdDev;

		// 确保延迟在指定范围内
		delay = Math.max(min, Math.min(max, delay));
		return Math.round(delay);
	}

	/**
	 * 模拟真实用户的页面交互行为
	 */
	private async _simulateUserInteraction(page: Page): Promise<void> {
		// 随机滚动
		const scrollActions = Math.floor(Math.random() * 3) + 1; // 1-3 次滚动
		for (let i = 0; i < scrollActions; i++) {
			const scrollHeight = Math.floor(Math.random() * 300) + 100; // 100-400px
			await page.evaluate(height => {
				window.scrollBy(0, height);
			}, scrollHeight);
			await this._simulateHumanBehavior('scroll');
		}

		// 随机鼠标移动
		const viewport = page.viewport();
		if (viewport) {
			const x = Math.floor(Math.random() * viewport.width);
			const y = Math.floor(Math.random() * viewport.height);
			await page.mouse.move(x, y);
		}
	}
}
