import { useState } from 'react';
import { AiChatMessage, Task } from '../../../types';
import { askAiTutor } from '../../ai/api/geminiService';

export const useAiChat = (task: Task | null, code: string, langLabel: string) => {
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<AiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const askAi = async () => {
    if (!question.trim() || !task) return;
    
    const userMsg: AiChatMessage = { role: 'user', text: question };
    setChat(prev => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const answer = await askAiTutor(task.title, code, userMsg.text, langLabel);
      setChat(prev => [...prev, { role: 'model', text: answer }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'model', text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    question,
    setQuestion,
    chat,
    isLoading,
    isOpen,
    setIsOpen,
    askAi
  };
};