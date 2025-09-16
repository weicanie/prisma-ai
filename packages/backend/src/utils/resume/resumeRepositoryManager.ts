import fs from 'fs';
import path from 'path';
import { ResumeData, ResumeRepositoryManager } from './type';

const resumesDirPath = path.join(process.cwd(), '..', '..', 'resumes');
const resumesDirManager = {
	createFile: async (fileName: string, content: string) => {
		try {
			resumesDirManager._initResumesDir();
			fs.writeFileSync(path.join(resumesDirPath, fileName), content);
		} catch (error) {
			console.error('Error creating file:', error);
		}
	},
	removeFile: async (fileName: string) => {
		try {
			resumesDirManager._initResumesDir();
			fs.unlinkSync(path.join(resumesDirPath, fileName));
		} catch (error) {
			console.error('Error removing file:', error);
		}
	},
	getFile: async (fileName: string) => {
		try {
			resumesDirManager._initResumesDir();
			return fs.readFileSync(path.join(resumesDirPath, fileName), 'utf-8');
		} catch (error) {
			console.error('Error getting file:', error);
		}
	},
	//获取当前目录中的所有json文件内容
	getFiles: async () => {
		try {
			resumesDirManager._initResumesDir();
			const files = fs.readdirSync(resumesDirPath);
			const jsonFiles = files.filter(file => file.endsWith('.json'));
			const filesContent = jsonFiles.map(file =>
				fs.readFileSync(path.join(resumesDirPath, file), 'utf-8')
			);
			return filesContent;
		} catch (error) {
			console.error('Error getting files:', error);
		}
	},
	_initResumesDir() {
		if (!fs.existsSync(resumesDirPath)) {
			fs.mkdirSync(resumesDirPath);
		}
	}
};

// 同步简历到文件系统
const syncResumeToFile_Server = async (resumeData: ResumeData, prevResume?: ResumeData) => {
	try {
		// 1、删除存在的旧文件
		try {
			if (prevResume && prevResume.title) {
				if (fs.existsSync(path.join(resumesDirPath, `${prevResume.title}.json`))) {
					// 避免简历标题发生变化时保留不再使用的文件
					resumesDirManager.removeFile(`${prevResume.title}.json`);
				}
			}
			if (fs.existsSync(path.join(resumesDirPath, `${resumeData.title}.json`))) {
				resumesDirManager.removeFile(`${resumeData.title}.json`);
			}
		} catch (error) {}
		// 2、创建新文件
		const fileName = `${resumeData.title}.json`;
		resumesDirManager.createFile(fileName, JSON.stringify(resumeData, null, 2));
	} catch (error) {
		console.error('Error syncing resume to file:', error);
	}
};
// 从文件系统中删除简历
const deleteResumeFromFile_Server = async (resume: ResumeData) => {
	try {
		resumesDirManager.removeFile(`${resume.title}.json`);
	} catch (error) {
		console.error('Error deleting resume file:', error);
	}
};
// 从文件系统中获取简历数据，并同步到store
const getResumesFromFiles_Server = async () => {
	try {
		const files = await resumesDirManager.getFiles();
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

