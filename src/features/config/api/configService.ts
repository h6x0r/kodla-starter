
import { NavItemConfig } from '../../../types';
import { configRepository, MOCK_PROMPTS } from '../data/repository';

export const configService = {
  
  getNavigation: async (): Promise<NavItemConfig[]> => {
    return new Promise(async (resolve) => {
      const items = await configRepository.getNavItems();
      setTimeout(() => resolve(items), 100);
    });
  },

  getPromptTemplate: async (key: keyof typeof MOCK_PROMPTS): Promise<string> => {
    return new Promise(async (resolve) => {
      const prompt = await configRepository.getPrompt(key);
      setTimeout(() => resolve(prompt || ''), 50);
    });
  }
};
