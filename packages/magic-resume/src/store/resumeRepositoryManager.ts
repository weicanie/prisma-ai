import { ResumeRepositoryManager } from '../types/repository';
import { ResumeData } from '../types/resume';
import { getFileHandle, verifyPermission } from '../utils/fileSystem';

// 同步简历到文件系统
const syncResumeToFile = async (resumeData: ResumeData, prevResume?: ResumeData) => {
	try {
		const handle = await getFileHandle('syncDirectory');
		if (!handle) {
			console.warn('No directory handle found');
			return;
		}

		const hasPermission = await verifyPermission(handle);
		if (!hasPermission) {
			console.warn('No permission to write to directory');
			return;
		}

		const dirHandle = handle as FileSystemDirectoryHandle;

		if (prevResume && prevResume.id === resumeData.id && prevResume.title !== resumeData.title) {
			try {
				await dirHandle.removeEntry(`${prevResume.title}.json`);
			} catch (error) {
				console.warn('Error deleting old file:', error);
			}
		}

		const fileName = `${resumeData.title}.json`;
		const fileHandle = await dirHandle.getFileHandle(fileName, {
			create: true
		});
		const writable = await fileHandle.createWritable();
		await writable.write(JSON.stringify(resumeData, null, 2));
		await writable.close();
	} catch (error) {
		console.error('Error syncing resume to file:', error);
	}
};
// 从文件系统中删除简历
// 不在具体业务逻辑中暴露文件句柄
const deleteResumeFromFile = async (resume: ResumeData) => {
	try {
		const handle = await getFileHandle('syncDirectory');
		if (!handle) return;

		const hasPermission = await verifyPermission(handle);
		if (!hasPermission) return;

		const dirHandle = handle as FileSystemDirectoryHandle;
		try {
			await dirHandle.removeEntry(`${resume.title}.json`);
		} catch (error) {}
	} catch (error) {
		console.error('Error deleting resume file:', error);
	}
};
// 从文件系统中获取简历数据，并同步到store
const getResumesFromFiles = async (updateResumeFromFile: (resume: ResumeData) => void) => {
	try {
		const handle = await getFileHandle('syncDirectory');
		if (!handle) return;

		const hasPermission = await verifyPermission(handle);
		if (!hasPermission) return;

		const dirHandle = handle as FileSystemDirectoryHandle;

		// @ts-ignore
		for await (const entry of dirHandle.values()) {
			if (entry.kind === 'file' && entry.name.endsWith('.json')) {
				try {
					const file = await entry.getFile();
					const content = await file.text();
					const resumeData = JSON.parse(content);
					// 将简历数据同步到store
					updateResumeFromFile(resumeData);
				} catch (error) {
					console.error('Error reading resume file:', error);
				}
			}
		}
	} catch (error) {
		console.error('Error syncing resumes from files:', error);
	}
};

const syncResuemToDB = async (resumeData: ResumeData, prevResume?: ResumeData) => {
	try {
		await fetch(`${process.env.PRISMA_AI_BACKEND_URL}/content/${resumeData.id}`, {
			method: 'Patch',
			body: JSON.stringify(resumeData),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});
	} catch (error) {
		console.error('Error syncing resume to database:', error);
	}
};

const deleteResumeFromDB = async (resumeData: ResumeData) => {
	try {
		await fetch(`${process.env.PRISMA_AI_BACKEND_URL}/resume/${resumeData.id}`, {
			method: 'Delete',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});
	} catch (error) {
		console.error('Error deleting resume from database:', error);
	}
};

const getResumesFromDB = async (updateResumeFromFile: (resume: ResumeData) => void) => {
	try {
		const response = await fetch(`${process.env.PRISMA_AI_BACKEND_URL}/resume/all`, {
			method: 'Get',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});
		const data = await response.json();
		for (const resume of data) {
			updateResumeFromFile(resume);
		}
	} catch (error) {
		console.error('Error getting resumes from database:', error);
	}
};

const fileManager: ResumeRepositoryManager = {
	syncResumeToRepository: syncResumeToFile,
	deleteResumeFromRepository: deleteResumeFromFile,
	getResumeFromRepository: getResumesFromFiles
};

const dbManager: ResumeRepositoryManager = {
	syncResumeToRepository: syncResuemToDB,
	deleteResumeFromRepository: deleteResumeFromDB,
	getResumeFromRepository: getResumesFromDB
};
const resumeRepoManager = fileManager;

export { resumeRepoManager };
