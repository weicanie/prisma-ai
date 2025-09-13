import {
	BasicInfo,
	CustomItem,
	Education,
	Experience,
	GlobalSettings,
	Project,
	ResumeData
} from './resume';

interface ResumeStore {
	resumes: Record<string, ResumeData>;
	activeResumeId: string | null;
	activeResume: ResumeData | null;

	createResume: (templateId: string | null) => string;
	deleteResume: (resume: ResumeData) => void;
	getResumesFromRepository: () => void;
	duplicateResume: (resumeId: string) => string;
	updateResume: (resumeId: string, data: Partial<ResumeData>) => void;
	setActiveResume: (resumeId: string) => void;
	updateResumeFromFile: (resume: ResumeData) => void;

	updateResumeTitle: (title: string) => void;
	updateBasicInfo: (data: Partial<BasicInfo>) => void;
	updateEducation: (data: Education) => void;
	updateEducationBatch: (educations: Education[]) => void;
	deleteEducation: (id: string) => void;
	updateExperience: (data: Experience) => void;
	updateExperienceBatch: (experiences: Experience[]) => void;
	deleteExperience: (id: string) => void;
	updateProjects: (project: Project) => void;
	updateProjectsBatch: (projects: Project[]) => void;
	deleteProject: (id: string) => void;
	setDraggingProjectId: (id: string | null) => void;
	updateSkillContent: (skillContent: string) => void;
	reorderSections: (newOrder: ResumeData['menuSections']) => void;
	toggleSectionVisibility: (sectionId: string) => void;
	setActiveSection: (sectionId: string) => void;
	updateMenuSections: (sections: ResumeData['menuSections']) => void;
	addCustomData: (sectionId: string) => void;
	updateCustomData: (sectionId: string, items: CustomItem[]) => void;
	removeCustomData: (sectionId: string) => void;
	addCustomItem: (sectionId: string) => void;
	updateCustomItem: (sectionId: string, itemId: string, updates: Partial<CustomItem>) => void;
	removeCustomItem: (sectionId: string, itemId: string) => void;
	updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
	setThemeColor: (color: string) => void;
	setTemplate: (templateId: string) => void;
	addResume: (resume: ResumeData) => string;
}

/**
 * 简历数据仓库管理器
 */
interface ResumeRepositoryManager {
	/**
	 * 进行简历数据的创建（C）和更新（U）
	 */
	syncResumeToRepository: (resumeData: ResumeData, prevResume?: ResumeData) => Promise<void>;
	/**
	 * 进行简历数据的删除（D）
	 */
	deleteResumeFromRepository: (resume: ResumeData) => Promise<void>;
	/**
	 * 进行简历数据的获取（R）
	 * @description 从文件系统或数据库中获取简历数据，并同步到store中
	 */
	getResumeFromRepository: (updateResumeFromFile: (resume: ResumeData) => void) => Promise<void>;
}

export { type ResumeRepositoryManager, type ResumeStore };
