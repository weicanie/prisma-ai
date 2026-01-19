import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'agent',
			component: () => import('@/views/agent/AgentView.vue')
		},
		{
			path: '/agent',
			name: 'agent',
			component: () => import('@/views/agent/AgentView.vue')
		}
	]
});

export default router;
