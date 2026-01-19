import { AIChatLLM } from '@prisma-ai/shared';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isOnline } from '../utils/constants';

export const useAIChatStore = defineStore('aichat', () => {
	const model = ref<AIChatLLM>(isOnline ? AIChatLLM.v3 : AIChatLLM.gemini_2_5_pro);
	const lastConversation = ref('');
	const project_id = ref('');

	function setAIChatLLM(newModel: AIChatLLM) {
		model.value = newModel;
	}

	function setAIChatLastConversation(newConversation: string) {
		lastConversation.value = newConversation;
	}

	function setAIChatProjectId(newProjectId: string) {
		project_id.value = newProjectId;
	}

	return {
		model,
		lastConversation,
		project_id,
		setAIChatLLM,
		setAIChatLastConversation,
		setAIChatProjectId
	};
});
