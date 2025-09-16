'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResumeStore } from '@/store/useResumeStore';

import classic from '@/assets/images/template-cover/classic.png';
import leftRight from '@/assets/images/template-cover/left-right.png';
import modern from '@/assets/images/template-cover/modern.png';
import timeline from '@/assets/images/template-cover/timeline.png';

import { DEFAULT_TEMPLATES } from '@/config';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useThemeStore } from '../../../../store/theme';

const templateImages: Record<string, StaticImageData> = {
	classic,
	modern,
	'left-right': leftRight,
	timeline
};

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 }
};

const TemplatesPage = () => {
	const t = useTranslations('dashboard.templates');
	const router = useRouter();
	const createResume = useResumeStore(state => state.createResume);
	const [previewTemplate, setPreviewTemplate] = useState<{
		id: string;
		open: boolean;
	} | null>(null);

	const { theme } = useThemeStore();
	const { setTheme } = useTheme();
	useEffect(() => {
		setTheme(theme);
	}, [theme]);

	const handleCreateResume = (templateId: string) => {
		const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
		if (!template) return;

		const resumeId = createResume(templateId);
		const { resumes, updateResume } = useResumeStore.getState();
		const resume = resumes[resumeId];

		if (resume) {
			updateResume(resumeId, {
				globalSettings: {
					...resume.globalSettings,
					themeColor: template.colorScheme.primary,
					sectionSpacing: template.spacing.sectionGap,
					paragraphSpacing: template.spacing.itemGap,
					pagePadding: template.spacing.contentPadding
				},
				basic: {
					...resume.basic,
					layout: template.basic.layout
				}
			});
		}

		router.push(process.env.NEXT_PUBLIC_NGINX_PREFIX ? process.env.NEXT_PUBLIC_NGINX_PREFIX + `/app/workbench/${resumeId}` : `/app/workbench/${resumeId}`);
	};

	return (
		<div className="container mx-auto py-6 px-4">
			<div className="flex flex-col space-y-8">
				<div className="px-4 sm:px-6 flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold tracking-tight">{t('title')}</h2>
					</div>

					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 400, damping: 17 }}
					>
						<Button
							onClick={() => router.push(process.env.NEXT_PUBLIC_NGINX_PREFIX ? process.env.NEXT_PUBLIC_NGINX_PREFIX + '/app/dashboard/resumes' : '/app/dashboard/resumes')}
							variant="default"
							className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
						>
							{t('imported')}
						</Button>
					</motion.div>
				</div>

				<motion.div
					variants={container}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{DEFAULT_TEMPLATES.map(template => {
						const templateKey = template.id === 'left-right' ? 'leftRight' : template.id;
						return (
							<motion.div key={template.id} variants={item}>
								<Card
									className={cn(
										'group cursor-pointer overflow-hidden transition-all hover:shadow-md max-w-[300px] mx-auto',
										'border border-gray-200 hover:border-primary/40 dark:border-gray-800 rounded-xl'
									)}
								>
									<CardContent className="p-0">
										<div className="relative aspect-[210/297] w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
											<div className="absolute top-0 right-0 z-10">
												<div className="flex items-center px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l border-b border-gray-200 dark:border-gray-700 rounded-bl-md">
													<span className="text-xs font-medium text-gray-700 dark:text-gray-200">
														{t(`${templateKey}.name`)}
													</span>
												</div>
											</div>

											<div className="h-full w-full p-3 transition-all duration-300 group-hover:scale-[1.01]">
												<div className="relative h-full w-full overflow-hidden rounded-lg shadow-sm">
													<Image
														src={templateImages[template.id]}
														alt={t(`${templateKey}.name`)}
														fill
														className="object-contain"
														sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
														priority
													/>
												</div>
											</div>

											<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

											<div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
												<p className="text-sm text-gray-100 leading-snug">
													{t(`${templateKey}.description`)}
												</p>
											</div>
										</div>

										<div className="p-3 bg-white dark:bg-gray-950 flex space-x-2 border-t border-gray-100 dark:border-gray-800">
											<Button
												variant="outline"
												className="flex-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
												onClick={e => {
													e.stopPropagation();
													setPreviewTemplate({ id: template.id, open: true });
												}}
											>
												{t('preview')}
											</Button>
											<Button
												className="flex-1 text-sm font-medium shadow-sm"
												onClick={e => {
													e.stopPropagation();
													handleCreateResume(template.id);
												}}
											>
												{t('useTemplate')}
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</motion.div>

				<Dialog
					open={previewTemplate?.open || false}
					onOpenChange={open => {
						if (!open) setPreviewTemplate(null);
					}}
				>
					{previewTemplate && (
						<DialogContent className="max-w-[680px] p-0 overflow-hidden border-0 shadow-lg rounded-xl bg-white dark:bg-gray-900">
							<div className="flex flex-col">
								<div className="border-b border-gray-100 dark:border-gray-800 px-4 py-4">
									<DialogTitle className="text-lg font-medium">
										{t(
											`${
												previewTemplate.id === 'left-right' ? 'leftRight' : previewTemplate.id
											}.name`
										)}
									</DialogTitle>
								</div>
								<div className="overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
									<div className="relative">
										<Image
											src={templateImages[previewTemplate.id]}
											alt={t(
												`${
													previewTemplate.id === 'left-right' ? 'leftRight' : previewTemplate.id
												}.name`
											)}
											width={600}
											height={848}
											className="rounded-md shadow-sm"
											priority
										/>
									</div>
								</div>
								<div className="p-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center">
									<Button
										className="w-full"
										onClick={() => {
											setPreviewTemplate(null);
											handleCreateResume(previewTemplate.id);
										}}
									>
										{t('useTemplate')}
									</Button>
								</div>
							</div>
						</DialogContent>
					)}
				</Dialog>
			</div>
		</div>
	);
};

export default TemplatesPage;
