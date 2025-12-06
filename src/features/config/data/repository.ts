
import { NavItemConfig } from '../../../types';

export const MOCK_NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', path: '/', iconKey: 'dashboard' },
  { label: 'Courses', path: '/courses', iconKey: 'book' },
  { label: 'Roadmap', path: '/roadmap', iconKey: 'map' },
  { label: 'My Tasks', path: '/my-tasks', iconKey: 'code' },
  { label: 'Analytics', path: '/analytics', iconKey: 'chart' },
  { label: 'Payments', path: '/premium', iconKey: 'creditCard' },
  { label: 'Settings', path: '/settings', iconKey: 'settings' },
];

export const MOCK_PROMPTS = {
  tutor: `
      You are an expert programming tutor for \${language}.
      The student is working on the task: "\${taskTitle}".
      
      Here is their current code:
      \`\`\`\${language}
      \${userCode}
      \`\`\`
      
      The student asks: "\${question}"
      
      Provide a helpful, concise hint or explanation. Do not give the full solution code directly. 
      Focus on guiding them to the answer. Use Markdown formatting.
  `,
};

export const configRepository = {
  getNavItems: async () => MOCK_NAV_ITEMS,
  getPrompt: async (key: keyof typeof MOCK_PROMPTS) => MOCK_PROMPTS[key]
};
