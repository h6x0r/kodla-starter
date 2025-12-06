
// Generate 365 days of heatmap data with counts
const generateYearlyData = () => {
  const data = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    
    // Random intensity 0-4 and counts
    const rand = Math.random();
    let intensity = 0;
    let count = 0;

    if (rand > 0.9) {
       intensity = 4;
       count = Math.floor(Math.random() * 6) + 10; // 10-15 tasks
    } else if (rand > 0.7) {
       intensity = 3;
       count = Math.floor(Math.random() * 5) + 5; // 5-9 tasks
    } else if (rand > 0.5) {
       intensity = 2;
       count = Math.floor(Math.random() * 3) + 2; // 2-4 tasks
    } else if (rand > 0.3) {
       intensity = 1;
       count = 1; // 1 task
    }
    // else 0

    data.push({
      date: d.toISOString().split('T')[0],
      intensity,
      count
    });
  }
  return data;
};

export const YEARLY_CONTRIBUTIONS = generateYearlyData();

// Helper to generate dynamic weekly data
export const getWeeklyActivity = (weekOffset: number) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Generate distinct patterns based on offset to simulate real history
  return days.map((day, idx) => {
    let base = 5;
    if (weekOffset === 0) base = [4, 7, 5, 12, 8, 15, 10][idx]; // Current week
    else if (weekOffset === 1) base = [8, 5, 2, 9, 11, 4, 6][idx]; // Last week
    else base = Math.floor(Math.random() * 12); // Older weeks
    
    return { name: day, tasks: base };
  });
};

export const analyticsRepository = {
  getWeekly: async (offset: number) => getWeeklyActivity(offset),
  getYearly: async () => YEARLY_CONTRIBUTIONS
};
