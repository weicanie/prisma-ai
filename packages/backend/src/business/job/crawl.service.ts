import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer from 'puppeteer';
import { Job, JobDocument } from './entities/job.entity';
//TODO 使用爬虫爬取前端、后端八股题库
//answer部分：点击按钮，获取整个答案的innerhtml，然后使用 llm 解析为md
//图片直接提取链接放入md中即可
//! 使用ai爬虫平台直接开爬！

//TODO 使用爬虫爬取boss直聘的职位信息?这个功能还得进一步设计

@Injectable()
export class CrawlService {
	@InjectModel(Job.name) private jobModel: Model<JobDocument>;
	/* boss直聘的网站已经发生大规模更改,此爬虫已失效 */
	async startSpider() {
		const browser = await puppeteer.launch({
			headless: false,
			defaultViewport: {
				width: 0,
				height: 0
			}
		});

		const page = await browser.newPage();

		await page.goto('https://www.zhipin.com/web/geek/job?query=前端&city=100010000');

		await page.waitForSelector('.job-list-box');

		const totalPage = await page.$eval('.options-pages a:nth-last-child(2)', e => {
			return parseInt(e.textContent!);
		});

		const allJobs: any[] = [];
		for (let i = 1; i <= totalPage; i++) {
			await page.goto('https://www.zhipin.com/web/geek/job?query=前端&city=100010000&page=' + i);

			await page.waitForSelector('.job-list-box');

			const jobs = await page.$eval('.job-list-box', el => {
				return [...el.querySelectorAll('.job-card-wrapper')].map(item => {
					return {
						job: {
							jobName: item.querySelector('.job-name')?.textContent,
							location: item.querySelector('.job-area')?.textContent,
							salary: item.querySelector('.salary')?.textContent
						},
						link: item.querySelector('a')?.href,
						companyName: {
							name: item.querySelector('.company-name')?.textContent
						}
					};
				});
			});
			allJobs.push(...jobs);
		}

		for (let i = 0; i < allJobs.length; i++) {
			await page.goto(allJobs[i].link);

			try {
				await page.waitForSelector('.job-sec-text');

				const jd = await page.$eval('.job-sec-text', el => {
					return el.textContent;
				});
				allJobs[i].desc = jd;

				const job = new Job();
				job.jobName = allJobs[i].job.name;
				job.location = allJobs[i].job.area;
				job.salary = allJobs[i].job.salary;
				job.link = allJobs[i].link;
				job.companyName = allJobs[i].company.name;
				job.description = allJobs[i].desc;
				job.userInfo = {
					userId: 'system',
					username: '系统爬虫'
				};
				//存入数据库
				await new this.jobModel(job).save();
			} catch (e) {
				console.error(`Error processing job ${i + 1}:`, e);
			}
			await browser.close();
		}
	}
}
