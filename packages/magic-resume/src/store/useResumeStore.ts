import { DEFAULT_TEMPLATES } from '@/config';
import { initialResumeState, initialResumeStateEn } from '@/config/initialResumeData';
import { generateUUID } from '@/utils/uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeStore } from '../types/repository';
import { Experience, GlobalSettings, MenuSection, Project, ResumeData } from '../types/resume';
import { resumeRepoManager } from './resumeRepositoryManager';

export const useResumeStore = create(
	persist<ResumeStore>(
		(set, get) => ({
			resumes: {},
			activeResumeId: null,
			activeResume: null,

			createResume: (templateId = null) => {
				const locale =
					typeof document !== 'undefined'
						? document.cookie
								.split('; ')
								.find(row => row.startsWith('NEXT_LOCALE='))
								?.split('=')[1] || 'zh'
						: 'zh';

				const initialResumeData = locale === 'en' ? initialResumeStateEn : initialResumeState;

				const id = generateUUID();
				const template = templateId
					? DEFAULT_TEMPLATES.find(t => t.id === templateId)
					: DEFAULT_TEMPLATES[0];

				const newResume: ResumeData = {
					...initialResumeData,
					id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					templateId: template?.id,
					title: `${locale === 'en' ? 'New Resume' : '新建简历'} ${id.slice(0, 6)}`
				};

				set(state => ({
					resumes: {
						...state.resumes,
						[id]: newResume
					},
					activeResumeId: id,
					activeResume: newResume
				}));

				resumeRepoManager.syncResumeToRepository(newResume);

				return id;
			},

			updateResume: (resumeId, data) => {
				set(state => {
					const resume = state.resumes[resumeId];
					if (!resume) return state;

					const updatedResume = {
						...resume,
						...data
					};

					resumeRepoManager.syncResumeToRepository(updatedResume, resume);

					return {
						resumes: {
							...state.resumes,
							[resumeId]: updatedResume
						},
						activeResume: state.activeResumeId === resumeId ? updatedResume : state.activeResume
					};
				});
			},

			getResumesFromRepository: () => {
				resumeRepoManager.getResumeFromRepository(get().updateResumeFromFile);
			},

			// 从文件更新，直接更新resumes
			updateResumeFromFile: resume => {
				set(state => ({
					resumes: {
						...state.resumes,
						[resume.id]: resume
					}
				}));
			},

			updateResumeTitle: title => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					get().updateResume(activeResumeId, { title });
				}
			},

			deleteResume: resume => {
				const resumeId = resume.id;
				set(state => {
					const { [resumeId]: _, activeResume, ...rest } = state.resumes;
					return {
						resumes: rest,
						activeResumeId: null,
						activeResume: null
					};
				});

				resumeRepoManager.deleteResumeFromRepository(resume);
			},

			duplicateResume: resumeId => {
				const newId = generateUUID();
				const originalResume = get().resumes[resumeId];

				// 获取当前语言环境
				const locale =
					typeof document !== 'undefined'
						? document.cookie
								.split('; ')
								.find(row => row.startsWith('NEXT_LOCALE='))
								?.split('=')[1] || 'zh'
						: 'zh';

				const duplicatedResume = {
					...originalResume,
					id: newId,
					title: `${originalResume.title} (${locale === 'en' ? 'Copy' : '复制'})`,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};

				set(state => ({
					resumes: {
						...state.resumes,
						[newId]: duplicatedResume
					},
					activeResumeId: newId,
					activeResume: duplicatedResume
				}));

				return newId;
			},

			setActiveResume: resumeId => {
				const resume = get().resumes[resumeId];
				if (resume) {
					set({ activeResume: resume, activeResumeId: resumeId });
				}
			},

			updateBasicInfo: data => {
				set(state => {
					if (!state.activeResume) return state;

					const updatedResume = {
						...state.activeResume,
						basic: {
							...state.activeResume.basic,
							...data
						}
					};

					const newState = {
						resumes: {
							...state.resumes,
							[state.activeResume.id]: updatedResume
						},
						activeResume: updatedResume
					};

					resumeRepoManager.syncResumeToRepository(updatedResume, state.activeResume);

					return newState;
				});
			},

			updateEducation: education => {
				const { activeResumeId, resumes } = get();
				if (!activeResumeId) return;

				const currentResume = resumes[activeResumeId];
				const newEducation = currentResume.education.some(e => e.id === education.id)
					? currentResume.education.map(e => (e.id === education.id ? education : e))
					: [...currentResume.education, education];

				get().updateResume(activeResumeId, { education: newEducation });
			},

			updateEducationBatch: educations => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					get().updateResume(activeResumeId, { education: educations });
				}
			},

			deleteEducation: id => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const resume = get().resumes[activeResumeId];
					const updatedEducation = resume.education.filter(e => e.id !== id);
					get().updateResume(activeResumeId, { education: updatedEducation });
				}
			},

			updateExperience: experience => {
				const { activeResumeId, resumes } = get();
				if (!activeResumeId) return;

				const currentResume = resumes[activeResumeId];
				const newExperience = currentResume.experience.find(e => e.id === experience.id)
					? currentResume.experience.map(e => (e.id === experience.id ? experience : e))
					: [...currentResume.experience, experience];

				get().updateResume(activeResumeId, { experience: newExperience });
			},

			updateExperienceBatch: (experiences: Experience[]) => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const updateData = { experience: experiences };
					get().updateResume(activeResumeId, updateData);
				}
			},
			deleteExperience: id => {
				const { activeResumeId, resumes } = get();
				if (!activeResumeId) return;

				const currentResume = resumes[activeResumeId];
				const updatedExperience = currentResume.experience.filter(e => e.id !== id);

				get().updateResume(activeResumeId, { experience: updatedExperience });
			},

			updateProjects: project => {
				const { activeResumeId, resumes } = get();
				if (!activeResumeId) return;
				const currentResume = resumes[activeResumeId];
				const newProjects = currentResume.projects.some(p => p.id === project.id)
					? currentResume.projects.map(p => (p.id === project.id ? project : p))
					: [...currentResume.projects, project];

				get().updateResume(activeResumeId, { projects: newProjects });
			},

			updateProjectsBatch: (projects: Project[]) => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const updateData = { projects };
					get().updateResume(activeResumeId, updateData);
				}
			},

			deleteProject: id => {
				const { activeResumeId } = get();
				if (!activeResumeId) return;
				const currentResume = get().resumes[activeResumeId];
				const updatedProjects = currentResume.projects.filter(p => p.id !== id);
				get().updateResume(activeResumeId, { projects: updatedProjects });
			},

			setDraggingProjectId: (id: string | null) => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					get().updateResume(activeResumeId, { draggingProjectId: id });
				}
			},

			updateSkillContent: skillContent => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					get().updateResume(activeResumeId, { skillContent });
				}
			},

			reorderSections: newOrder => {
				const { activeResumeId, resumes } = get();
				if (activeResumeId) {
					const currentResume = resumes[activeResumeId];
					const basicInfoSection = currentResume.menuSections.find(
						section => section.id === 'basic'
					);
					const reorderedSections = [
						basicInfoSection,
						...newOrder.filter(section => section.id !== 'basic')
					].map((section, index) => ({
						...section,
						order: index
					}));
					get().updateResume(activeResumeId, {
						menuSections: reorderedSections as MenuSection[]
					});
				}
			},

			toggleSectionVisibility: sectionId => {
				const { activeResumeId, resumes } = get();
				if (activeResumeId) {
					const currentResume = resumes[activeResumeId];
					const updatedSections = currentResume.menuSections.map(section =>
						section.id === sectionId ? { ...section, enabled: !section.enabled } : section
					);
					get().updateResume(activeResumeId, { menuSections: updatedSections });
				}
			},

			setActiveSection: sectionId => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					get().updateResume(activeResumeId, { activeSection: sectionId });
				}
			},

			updateMenuSections: sections => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					get().updateResume(activeResumeId, { menuSections: sections });
				}
			},

			addCustomData: sectionId => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const currentResume = get().resumes[activeResumeId];
					const updatedCustomData = {
						...currentResume.customData,
						[sectionId]: [
							{
								id: generateUUID(),
								title: '未命名模块',
								subtitle: '',
								dateRange: '',
								description: '',
								visible: true
							}
						]
					};
					get().updateResume(activeResumeId, { customData: updatedCustomData });
				}
			},

			updateCustomData: (sectionId, items) => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const currentResume = get().resumes[activeResumeId];
					const updatedCustomData = {
						...currentResume.customData,
						[sectionId]: items
					};
					get().updateResume(activeResumeId, { customData: updatedCustomData });
				}
			},

			removeCustomData: sectionId => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const currentResume = get().resumes[activeResumeId];
					const { [sectionId]: _, ...rest } = currentResume.customData;
					get().updateResume(activeResumeId, { customData: rest });
				}
			},

			addCustomItem: sectionId => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const currentResume = get().resumes[activeResumeId];
					const updatedCustomData = {
						...currentResume.customData,
						[sectionId]: [
							...(currentResume.customData[sectionId] || []),
							{
								id: generateUUID(),
								title: '未命名模块',
								subtitle: '',
								dateRange: '',
								description: '',
								visible: true
							}
						]
					};
					get().updateResume(activeResumeId, { customData: updatedCustomData });
				}
			},

			updateCustomItem: (sectionId, itemId, updates) => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const currentResume = get().resumes[activeResumeId];
					const updatedCustomData = {
						...currentResume.customData,
						[sectionId]: currentResume.customData[sectionId].map(item =>
							item.id === itemId ? { ...item, ...updates } : item
						)
					};
					get().updateResume(activeResumeId, { customData: updatedCustomData });
				}
			},

			removeCustomItem: (sectionId, itemId) => {
				const { activeResumeId } = get();
				if (activeResumeId) {
					const currentResume = get().resumes[activeResumeId];
					const updatedCustomData = {
						...currentResume.customData,
						[sectionId]: currentResume.customData[sectionId].filter(item => item.id !== itemId)
					};
					get().updateResume(activeResumeId, { customData: updatedCustomData });
				}
			},

			updateGlobalSettings: (settings: Partial<GlobalSettings>) => {
				const { activeResumeId, updateResume, activeResume } = get();
				if (activeResumeId) {
					updateResume(activeResumeId, {
						globalSettings: {
							...activeResume?.globalSettings,
							...settings
						}
					});
				}
			},

			setThemeColor: color => {
				const { activeResumeId, updateResume } = get();
				if (activeResumeId) {
					updateResume(activeResumeId, {
						globalSettings: {
							...get().activeResume?.globalSettings,
							themeColor: color
						}
					});
				}
			},

			setTemplate: templateId => {
				const { activeResumeId, resumes } = get();
				if (!activeResumeId) return;

				const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
				if (!template) return;

				const updatedResume = {
					...resumes[activeResumeId],
					templateId,
					globalSettings: {
						...resumes[activeResumeId].globalSettings,
						themeColor: template.colorScheme.primary,
						sectionSpacing: template.spacing.sectionGap,
						paragraphSpacing: template.spacing.itemGap,
						pagePadding: template.spacing.contentPadding
					},
					basic: {
						...resumes[activeResumeId].basic,
						layout: template.basic.layout
					}
				};

				set({
					resumes: {
						...resumes,
						[activeResumeId]: updatedResume
					},
					activeResume: updatedResume
				});
			},
			addResume: (resume: ResumeData) => {
				set(state => ({
					resumes: {
						...state.resumes,
						[resume.id]: resume
					},
					activeResumeId: resume.id
				}));

				resumeRepoManager.syncResumeToRepository(resume);
				return resume.id;
			}
		}),
		{
			name: 'resume-storage'
		}
	)
);
