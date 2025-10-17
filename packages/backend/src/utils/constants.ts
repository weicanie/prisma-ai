import * as fs from 'fs';
import * as path from 'path';
import { pathExist } from './path_exsist';

/**
 * 递归复制目录及其所有内容
 * @param srcDir 源目录路径
 * @param destDir 目标目录路径
 */
function _copyDirectoryRecursive(srcDir: string, destDir: string): void {
	// 确保目标目录存在
	pathExist(destDir);

	// 读取源目录中的所有项目
	const items = fs.readdirSync(srcDir, { withFileTypes: true });

	for (const item of items) {
		const srcPath = path.join(srcDir, item.name);
		const destPath = path.join(destDir, item.name);

		if (item.isDirectory()) {
			// 递归复制子目录
			_copyDirectoryRecursive(srcPath, destPath);
		} else if (item.isFile()) {
			// 复制文件，如果目标文件不存在
			if (!fs.existsSync(destPath)) {
				fs.copyFileSync(srcPath, destPath);
			}
		}
	}
}

//脚本
export const cloneProjectScriptPath = path.join(process.cwd(), 'scripts', 'clone_repo.sh');
export const deepwikiDownScriptPath = path.join(process.cwd(), 'scripts', 'deepwiki-down.sh');
const data_dir = {
	/* v5.0.2及之前使用的旧目录结构 */
	deepwikiDownOutputPath: path.join(process.cwd(), '..', '..', 'project_wikis'),
	projectsDirPath: path.join(process.cwd(), '..', '..', 'projects'),
	agentConfigPath: path.join(process.cwd(), 'prisma_agent_config.json'),
	resumesDirPath: path.join(process.cwd(), '..', '..', 'resumes'),
	//日志
	baseLogsDir: path.join(process.cwd(), 'logs')
};

export const user_data_dir = {
	//下载的用户项目 deepwiki md文件
	deepwikiDownOutputPath: (userId: string | number) => {
		const pathRes = path.join(process.cwd(), '..', '..', 'user_data', `${userId}`, 'project_wikis');
		pathExist(pathRes);
		return pathRes;
	},
	//用户项目代码仓库
	projectsDirPath: (userId: string | number) => {
		const pathRes = path.join(process.cwd(), '..', '..', 'user_data', `${userId}`, 'projects');
		pathExist(pathRes);
		return pathRes;
	},
	//prisma_agent配置
	agentConfigPath: (userId: string | number) => {
		const pathRes = path.join(
			process.cwd(),
			'..',
			'..',
			'user_data',
			`${userId}`,
			'prisma_agent_config.json'
		);
		pathExist(pathRes);
		return pathRes;
	},
	//agent输出
	agentOutputPath: (userId: string | number) => {
		const pathRes = path.join(process.cwd(), '..', '..', 'user_data', `${userId}`, 'agent_output');
		pathExist(pathRes);
		return pathRes;
	},
	//用户简历数据
	resumesDirPath: (userId: string | number) => {
		const pathRes = path.join(process.cwd(), '..', '..', 'user_data', `${userId}`, 'resumes');
		pathExist(pathRes);
		return pathRes;
	},
	//初始化用户agent配置
	_initUserAgentConfig: (userId: string | number) => {
		const agentConfigPath = user_data_dir.agentConfigPath(userId);
		if (!fs.existsSync(agentConfigPath)) {
			fs.writeFileSync(agentConfigPath, JSON.stringify(defaultAgentConfig, null, 2));
		}
	},
	//初始化用户所有数据文件夹、文件
	initUserDir: (userId: string | number) => {
		pathExist(user_data_dir.deepwikiDownOutputPath(userId));
		pathExist(user_data_dir.projectsDirPath(userId));
		pathExist(user_data_dir.agentConfigPath(userId));
		pathExist(user_data_dir.resumesDirPath(userId));
		user_data_dir._initUserAgentConfig(userId);
	},
	/**
	 * 迁移：将 v5.0.2 及之前的版本的用户数据文件夹中的数据自动迁移到新位置
	 */
	migrateUserDir: (userId: string | number) => {
		// 首先初始化用户目录结构
		user_data_dir.initUserDir(userId);

		try {
			// 迁移项目文件夹
			const oldProjectsPath = data_dir.projectsDirPath;
			const newProjectsPath = user_data_dir.projectsDirPath(userId);
			if (fs.existsSync(oldProjectsPath) && fs.readdirSync(oldProjectsPath).length > 0) {
				console.log(
					`[迁移 用户${userId}] 开始迁移项目文件夹: ${oldProjectsPath} -> ${newProjectsPath}`
				);
				_copyDirectoryRecursive(oldProjectsPath, newProjectsPath);
				console.log(`[迁移 用户${userId}] 项目文件夹迁移完成`);
			}

			// 迁移简历数据文件夹
			const oldResumesPath = data_dir.resumesDirPath;
			const newResumesPath = user_data_dir.resumesDirPath(userId);
			if (fs.existsSync(oldResumesPath) && fs.readdirSync(oldResumesPath).length > 0) {
				console.log(
					`[迁移 用户${userId}] 开始迁移简历数据文件夹: ${oldResumesPath} -> ${newResumesPath}`
				);
				_copyDirectoryRecursive(oldResumesPath, newResumesPath);
				console.log(`[迁移 用户${userId}] 简历数据文件夹迁移完成`);
			}

			// 迁移 deepwiki 输出文件夹
			const oldDeepwikiPath = data_dir.deepwikiDownOutputPath;
			const newDeepwikiPath = user_data_dir.deepwikiDownOutputPath(userId);
			if (fs.existsSync(oldDeepwikiPath) && fs.readdirSync(oldDeepwikiPath).length > 0) {
				console.log(`[迁移] 开始迁移 deepwiki 文件夹: ${oldDeepwikiPath} -> ${newDeepwikiPath}`);
				_copyDirectoryRecursive(oldDeepwikiPath, newDeepwikiPath);
				console.log(`[迁移] deepwiki 文件夹迁移完成`);
			}

			// 迁移 agent 配置文件
			const oldAgentConfigPath = data_dir.agentConfigPath;
			const newAgentConfigPath = user_data_dir.agentConfigPath(userId);
			if (fs.existsSync(oldAgentConfigPath)) {
				console.log(
					`[迁移 用户${userId}] 开始迁移 agent 配置文件: ${oldAgentConfigPath} -> ${newAgentConfigPath}`
				);
				fs.copyFileSync(oldAgentConfigPath, newAgentConfigPath);
				console.log(`[迁移 用户${userId}] agent 配置文件迁移完成`);
			}

			console.log(`[迁移 用户${userId}] 的数据迁移完成`);
		} catch (error) {
			console.error(`[尝试迁移 用户${userId}] 数据失败，不需要迁移则可忽略此错误:`, error);
		}
	}
};

export const defaultAgentConfig = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'data', 'prisma_agent_config_default.json'), 'utf-8')
);

export const baseLogsDir = data_dir.baseLogsDir;
