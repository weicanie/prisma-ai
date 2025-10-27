import { UserInfoFromToken } from '@prisma-ai/shared';
import fs from 'fs';
import path from 'path';
import { user_data_dir } from '../constants';
import { ResumeData, ResumeRepositoryManager } from './type';

const resumesDirManager = {
	createFile: async (fileName: string, content: string, userInfo: UserInfoFromToken) => {
		try {
			resumesDirManager._initResumesDir(userInfo);
			fs.writeFileSync(path.join(user_data_dir.resumesDirPath(userInfo.userId), fileName), content);
		} catch (error) {
			console.error('Error creating file:', error);
		}
	},
	removeFile: async (fileName: string, userInfo: UserInfoFromToken) => {
		try {
			resumesDirManager._initResumesDir(userInfo);
			fs.unlinkSync(path.join(user_data_dir.resumesDirPath(userInfo.userId), fileName));
		} catch (error) {
			console.error('Error removing file:', error);
		}
	},
	getFile: async (fileName: string, userInfo: UserInfoFromToken) => {
		try {
			resumesDirManager._initResumesDir(userInfo);
			return fs.readFileSync(
				path.join(user_data_dir.resumesDirPath(userInfo.userId), fileName),
				'utf-8'
			);
		} catch (error) {
			console.error('Error getting file:', error);
		}
	},
	//获取当前目录中的所有json文件内容
	getFiles: async (userInfo: UserInfoFromToken) => {
		try {
			resumesDirManager._initResumesDir(userInfo);
			const files = fs.readdirSync(user_data_dir.resumesDirPath(userInfo.userId));
			const jsonFiles = files.filter(file => file.endsWith('.json'));
			const filesContent = jsonFiles.map(file =>
				fs.readFileSync(path.join(user_data_dir.resumesDirPath(userInfo.userId), file), 'utf-8')
			);
			return filesContent;
		} catch (error) {
			console.error('Error getting files:', error);
		}
	},
	_initResumesDir(userInfo: UserInfoFromToken) {
		if (!fs.existsSync(user_data_dir.resumesDirPath(userInfo.userId))) {
			fs.mkdirSync(user_data_dir.resumesDirPath(userInfo.userId));
		}
	}
};

// 同步简历到文件系统
const syncResumeToFile_Server = async (
	resumeData: ResumeData,
	userInfo: UserInfoFromToken,
	prevResume?: ResumeData
) => {
	try {
		// 1、删除存在的旧文件
		try {
			if (prevResume && prevResume.id) {
				if (
					fs.existsSync(
						path.join(user_data_dir.resumesDirPath(userInfo.userId), `${prevResume.id}.json`)
					)
				) {
					// 避免简历标题发生变化时保留不再使用的文件
					resumesDirManager.removeFile(`${prevResume.id}.json`, userInfo);
				}
			}
			if (
				fs.existsSync(
					path.join(user_data_dir.resumesDirPath(userInfo.userId), `${resumeData.id}.json`)
				)
			) {
				resumesDirManager.removeFile(`${resumeData.id}.json`, userInfo);
			}
		} catch (error) {}
		// 2、创建新文件
		const fileName = `${resumeData.id}.json`;
		resumesDirManager.createFile(fileName, JSON.stringify(resumeData, null, 2), userInfo);
	} catch (error) {
		console.error('Error syncing resume to file:', error);
	}
};
// 从文件系统中删除简历
const deleteResumeFromFile_Server = async (resume: ResumeData, userInfo: UserInfoFromToken) => {
	try {
		resumesDirManager.removeFile(`${resume.id}.json`, userInfo);
	} catch (error) {
		console.error('Error deleting resume file:', error);
	}
};
// 从文件系统中获取简历数据，并同步到store
const getResumesFromFiles_Server = async (userInfo: UserInfoFromToken) => {
	try {
		const files = await resumesDirManager.getFiles(userInfo);
		const resumeDatas: ResumeData[] = [];

		for await (const file of files ?? []) {
			try {
				const resumeData = JSON.parse(file);
				// 将简历数据同步到store（在magic-resume中实现）
				// updateResumeFromFile(resumeData);
				resumeDatas.push(resumeData);
			} catch (error) {
				console.error('Error reading resume file:', error);
			}
		}
		return resumeDatas;
	} catch (error) {
		console.error('Error syncing resumes from files:', error);
		return [];
	}
};
// 使用服务端的文件系统（需要在服务端组件使用）
const serverResumefileManager: ResumeRepositoryManager = {
	getResumeFromRepository: getResumesFromFiles_Server,
	syncResumeToRepository: syncResumeToFile_Server,
	deleteResumeFromRepository: deleteResumeFromFile_Server
};

export { serverResumefileManager };
