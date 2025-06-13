import { z } from 'zod';
import { roadFromDiffSchema } from './learn.schema';

export type RoadFromDiffDto = z.infer<typeof roadFromDiffSchema>;

interface ProjectRoadItem {
	tech: {
		name: string;
		desc: string;
	}[];
	lightspot: {
		name: string;
		desc: string;
	}[];
}

interface SkillRoadItem {
	tech: {
		name: string;
		desc: string;
	}[];
}

interface RoadFromDiff {
	skill: SkillRoadItem;
	project: ProjectRoadItem[];
}
