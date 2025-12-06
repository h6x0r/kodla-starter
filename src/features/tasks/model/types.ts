export interface Task {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  isPremium: boolean;
  initialCode: string;
  solutionCode?: string; // Canonical solution code
  hints?: string[];
  estimatedTime: string; // e.g. "30m"
  status?: 'pending' | 'completed'; // For UI display
  youtubeUrl?: string; // Optional link to video solution
}

export interface Submission {
  id: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  score: number;
  runtime: string;
  createdAt: string;
  code: string;
  message?: string; // Console output / Test results
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
}
