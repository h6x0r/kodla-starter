
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IconPlay, IconX, IconSparkles, IconCode, IconClock, IconChevronDown, IconBook } from '../components/Icons';
import { AuthContext } from '../components/Layout';
import { MOCK_SUBMISSIONS } from '../features/tasks/data/mockData';
import { taskService } from '../features/tasks/api/taskService';
import { askAiTutor } from '../features/ai/api/geminiService';
import { Task, Submission, AiChatMessage } from '../types';

// UI Components
import { WorkspaceHeader } from '../features/tasks/ui/components/WorkspaceHeader';
import { TaskDescriptionPanel } from '../features/tasks/ui/components/TaskDescriptionPanel';
import { AiTutorPanel } from '../features/tasks/ui/components/AiTutorPanel';
import { CodeEditorPanel } from '../features/tasks/ui/components/CodeEditorPanel';
import { VideoSolutionPanel } from '../features/tasks/ui/components/VideoSolutionPanel';
import { useTaskState } from '../features/tasks/model/useTaskState';
import { useTaskRunner } from '../features/tasks/model/useTaskRunner';
import { useAiChat } from '../features/tasks/model/useAiChat';
import { useToast } from '../components/Toast';

const TaskWorkspace = () => {
  const { slug, courseId } = useParams();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  // Mobile State
  const [mobileTab, setMobileTab] = useState<'task' | 'code' | 'ai'>('task');

  // 1. Data Layer
  const { task, isLoading } = useTaskState(slug);

  // 2. Logic Layer
  const { 
    code, setCode, 
    activeTab, setActiveTab, 
    submissions, isRunning, 
    runCode 
  } = useTaskRunner(task);

  // Derived State
  const isGo = courseId?.includes('c_go') || task?.tags.includes('go') || slug?.includes('go');
  const langLabel = isGo ? 'Go' : 'Java';
  const fileExt = isGo ? '.go' : '.java';
  const backLink = courseId ? `/course/${courseId}` : '/courses';

  // 3. AI Layer
  const {
    question, setQuestion,
    chat, isLoading: aiLoading,
    isOpen: aiPanelOpen, setIsOpen: setAiPanelOpen,
    askAi
  } = useAiChat(task, code, langLabel);

  // Wrapper for run code to show toast
  const handleRunAndToast = async () => {
      // Logic inside runCode updates submissions and switches tab.
      await runCode();
  };

  // Watch for successful submissions to trigger toast
  React.useEffect(() => {
    if (submissions.length > 0 && submissions[0].status === 'passed' && !isRunning) {
        showToast('🎉 Tests Passed! Great job.', 'success');
    }
  }, [submissions, isRunning, showToast]);

  // Update Page Title
  useEffect(() => {
    if (task) {
      document.title = `${task.title} - KODLA`;
    }
  }, [task]);


  if (isLoading || !task) {
    return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">Loading Environment...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 bg-gray-100 dark:bg-black relative">
      
      <WorkspaceHeader 
        task={task} 
        backLink={backLink} 
        langLabel={langLabel} 
        isRunning={isRunning} 
        onRun={handleRunAndToast}
        onSubmit={handleRunAndToast}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0 relative">
        
        {/* LEFT PANEL (Description & Video & AI) */}
        {/* Hidden on mobile unless tab is task or ai */}
        <div className={`
            flex-col bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border
            w-full md:w-[40%] md:min-w-[350px] md:max-w-[50%] md:flex
            ${mobileTab === 'code' ? 'hidden' : 'flex'}
        `}>
          
          {/* On Mobile: Show Description only if tab is 'task' */}
          <div className={`flex-1 overflow-hidden flex flex-col ${mobileTab === 'ai' ? 'hidden md:flex' : 'flex'}`}>
            <TaskDescriptionPanel task={task} />
          </div>

          {/* Video Solution Panel */}
          {/* Always visible on Desktop if URL exists, hidden on mobile if tab is AI */}
          <div className={`${mobileTab === 'ai' ? 'hidden md:block' : 'block'}`}>
             <VideoSolutionPanel videoUrl={task.youtubeUrl} />
          </div>

          {/* AI Panel:
             - Desktop: Accordion at bottom of left panel
             - Mobile: Full screen if tab is 'ai', otherwise hidden
          */}
          <div className={`
             ${mobileTab === 'ai' ? 'flex-1 flex flex-col h-full' : ''}
             ${mobileTab === 'task' ? 'hidden md:block' : ''}
          `}>
             <AiTutorPanel 
                isOpen={mobileTab === 'ai' ? true : aiPanelOpen} // Force open on mobile tab
                onToggle={() => setAiPanelOpen(!aiPanelOpen)}
                chat={chat}
                question={question}
                onQuestionChange={setQuestion}
                onSend={askAi}
                isLoading={aiLoading}
                isPremium={!!user?.isPremium}
              />
          </div>
        </div>

        {/* RIGHT PANEL (Editor) */}
        {/* Hidden on mobile unless tab is code */}
        <div className={`
            flex-1 flex-col bg-[#1e1e1e] border-l border-gray-800
            w-full md:w-auto md:flex
            ${mobileTab !== 'code' ? 'hidden' : 'flex'}
        `}>
          <CodeEditorPanel 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              code={code}
              setCode={setCode}
              isGo={!!isGo}
              fileExt={fileExt}
              isPremium={!!user?.isPremium}
              submissions={submissions}
              task={task}
          />
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border flex items-center justify-around z-50 pb-safe">
        <button 
          onClick={() => setMobileTab('task')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileTab === 'task' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}
        >
          <IconBook className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Task</span>
        </button>

        <button 
          onClick={() => setMobileTab('code')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileTab === 'code' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}
        >
          <IconCode className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Editor</span>
        </button>

        <button 
          onClick={() => setMobileTab('ai')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileTab === 'ai' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}
        >
          <IconSparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Tutor</span>
        </button>
      </div>

    </div>
  );
};

export default TaskWorkspace;
