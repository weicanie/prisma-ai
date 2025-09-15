import { create } from 'zustand';
export const useThemeStore = create<{
	theme: string;
	setThemeOfStore: (theme: string) => void;
}>(set => ({
	theme: 'system',
	setThemeOfStore: (theme: string) => set({ theme })
}));
