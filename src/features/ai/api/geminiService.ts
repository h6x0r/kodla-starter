import { api } from '../../../services/api';

interface AiResponse {
  answer: string;
  remaining?: number;
}

export const askAiTutor = async (
  taskTitle: string,
  userCode: string,
  question: string,
  language: string
): Promise<string> => {
  try {
    const data = await api.post<AiResponse>('/ai/tutor', {
        taskTitle,
        userCode,
        question,
        language
    });
    
    return data.answer;
  } catch (error: any) {
    console.error("AI Tutor Error:", error);
    if (error.status === 403) {
        return "You have reached your daily AI limit. Please upgrade to Premium or come back tomorrow!";
    }
    return "Sorry, I'm having trouble connecting to the AI brain right now. Please try again later.";
  }
};