import { AIChatLLM, type ImplementDto } from '@prisma-ai/shared';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isOnline } from '../utils/constants';

export const useAIChatStore = defineStore('aichat', () => {
	const model = ref<AIChatLLM>(isOnline ? AIChatLLM.v3 : AIChatLLM.gemini_2_5_pro);
	const lastConversation = ref('');
	const project_id = ref('');
	const fixedContent = ref('');

	const implementDto = ref<ImplementDto>({
		lightspot: '',
		projectPath: '',
		projectId: ''
	});

	function setAIChatLLM(newModel: AIChatLLM) {
		model.value = newModel;
	}

	function setAIChatLastConversation(newConversation: string) {
		lastConversation.value = newConversation;
	}

	function setAIChatProjectId(newProjectId: string) {
		project_id.value = newProjectId;
		setAIChatImplementDto({ projectId: newProjectId });
	}

	function setAIChatImplementDto(newImplementDto: Partial<ImplementDto>) {
		implementDto.value = { ...implementDto.value, ...newImplementDto };
	}

	function setAIChatFixedContent(newFixedContent: string) {
		fixedContent.value = newFixedContent;
	}

	return {
		model,
		lastConversation,
		project_id,
		implementDto,
		fixedContent,
		setAIChatLLM,
		setAIChatLastConversation,
		setAIChatProjectId,
		setAIChatImplementDto,
		setAIChatFixedContent
	};
});
