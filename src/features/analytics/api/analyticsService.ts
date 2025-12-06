
import { analyticsRepository } from '../data/repository';

export const analyticsService = {
  
  getWeeklyStats: async (weekOffset: number) => {
    return new Promise<{ name: string; tasks: number }[]>(async (resolve) => {
      const data = await analyticsRepository.getWeekly(weekOffset);
      setTimeout(() => {
        resolve(data);
      }, 300);
    });
  },

  getYearlyContributions: async () => {
    return new Promise<{ date: string; intensity: number; count: number }[]>(async (resolve) => {
      const data = await analyticsRepository.getYearly();
      setTimeout(() => {
        resolve(data);
      }, 500);
    });
  }
};
