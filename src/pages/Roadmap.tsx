
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { IconCheck, IconTarget, IconTrophy, IconBriefcase, IconCode, IconRefresh, IconPlay } from '../components/Icons';
import { RoadmapUI } from '../features/roadmap/model/types';
import { roadmapService } from '../features/roadmap/api/roadmapService';
import { AuthContext } from '../components/Layout';
import { STORAGE_KEYS } from '../config/constants';

const RoadmapPage = () => {
  const { user } = useContext(AuthContext);
  
  // 1. Synchronously initialize state from localStorage to prevent "Wizard Flash"
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROADMAP_PREFS);
    return saved ? JSON.parse(saved) : { role: '', level: '', goal: '' };
  });

  // If preferences exist, start in 'loading' state immediately, skipping 'wizard'
  const [step, setStep] = useState<'wizard' | 'loading' | 'result'>(() => {
    return localStorage.getItem(STORAGE_KEYS.ROADMAP_PREFS) ? 'loading' : 'wizard';
  });

  const [wizardStep, setWizardStep] = useState(0);
  const [roadmap, setRoadmap] = useState<RoadmapUI | null>(null);

  // Loading Animation State
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 2. Fetch data on mount if we have preferences
  useEffect(() => {
    if (step === 'loading' && preferences.role) {
      // Immediate fetch without the long animation sequence
      loadRoadmapData(preferences.role, preferences.level);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoadmapData = async (role: string, level: string) => {
    try {
      const userId = user?.id || 'guest';
      const data = await roadmapService.generateUserRoadmap(role, level, userId);
      setRoadmap(data);
      setStep('result');
    } catch (e) {
      console.error("Failed to load roadmap", e);
      setStep('wizard'); // Fallback if data is corrupt
    }
  };

  const startGeneration = async () => {
    setStep('loading');
    localStorage.setItem(STORAGE_KEYS.ROADMAP_PREFS, JSON.stringify(preferences));

    const phases = [
      "Analyzing Profile...",
      "Scanning Market Requirements...",
      "Mapping Dependencies...",
      "Selecting Best Resources...",
      "Finalizing Roadmap..."
    ];
    
    for (let i = 0; i < phases.length; i++) {
       setLoadingText(phases[i]);
       setLoadingProgress((i + 1) * (100 / phases.length));
       await new Promise(r => setTimeout(r, 600));
    }

    await loadRoadmapData(preferences.role, preferences.level);
  };

  const handleSelect = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    if (wizardStep < 2) { // 3 questions (0, 1, 2)
      setWizardStep(prev => prev + 1);
    } else {
      startGeneration();
    }
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEYS.ROADMAP_PREFS);
    setStep('wizard');
    setWizardStep(0);
    setPreferences({ role: '', level: '', goal: '' });
    setRoadmap(null);
  };

  // --- RENDERERS ---

  if (step === 'wizard') {
    const questions = [
        {
          id: 'role',
          title: 'What is your primary focus?',
          options: [
            { id: 'backend-go', label: 'Backend (Go)', icon: <div className="text-2xl">🐹</div> },
            { id: 'backend-java', label: 'Backend (Java)', icon: <div className="text-2xl">☕</div> },
            { id: 'fullstack', label: 'Fullstack', icon: <div className="text-2xl">🌐</div> },
          ]
        },
        {
          id: 'level',
          title: 'What is your current experience?',
          options: [
            { id: 'junior', label: 'Junior (0-2 yrs)', icon: <IconCode className="w-6 h-6"/> },
            { id: 'mid', label: 'Mid-Level (3-5 yrs)', icon: <IconBriefcase className="w-6 h-6"/> },
            { id: 'senior', label: 'Senior (5+ yrs)', icon: <IconTrophy className="w-6 h-6"/> },
          ]
        },
        {
          id: 'goal',
          title: 'What is your main goal?',
          options: [
            { id: 'job', label: 'Land a New Job', icon: <IconBriefcase className="w-6 h-6"/> },
            { id: 'promo', label: 'Get Promoted', icon: <IconTrophy className="w-6 h-6"/> },
            { id: 'skill', label: 'Master Specific Skill', icon: <IconTarget className="w-6 h-6"/> },
          ]
        }
    ];

    const q = questions[wizardStep];
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto px-4">
        <div className="w-full bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-xl text-center">
          <div className="mb-8">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Step {wizardStep + 1} of 3</span>
            <div className="w-full bg-gray-100 dark:bg-dark-bg h-1.5 mt-4 rounded-full overflow-hidden">
               <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${((wizardStep + 1) / 3) * 100}%` }}></div>
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-10">{q.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {q.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(q.id, opt.id)}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-gray-100 dark:border-dark-border hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-dark-bg group-hover:bg-white dark:group-hover:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-brand-600 shadow-sm group-hover:shadow-md transition-all">
                  {opt.icon}
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-600">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
         <div className="w-full max-w-sm">
             <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-dark-border rounded-full opacity-20"></div>
                <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                {/* Only show percentage if we are in the animation sequence, otherwise just a spinner is fine */}
                {loadingProgress > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl text-brand-500 animate-pulse">
                    {Math.round(loadingProgress)}%
                    </div>
                )}
             </div>
             <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300">
               {loadingText === 'Initializing...' ? 'Loading Roadmap...' : loadingText}
             </h2>
             {loadingProgress > 0 && (
                <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden mt-6">
                <div className="h-full bg-gradient-to-r from-brand-400 to-blue-600 transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }}></div>
                </div>
             )}
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Your Personal Roadmap</h1>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full uppercase">{roadmap?.roleTitle}</span>
             <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase">{roadmap?.targetLevel}</span>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600 transition-colors">
          <IconRefresh className="w-4 h-4"/> Regenerate
        </button>
      </div>

      <div className="relative space-y-12">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-1 bg-gray-200 dark:bg-dark-border rounded-full"></div>

        {roadmap?.phases.map((phase) => (
          <div key={phase.id} className="relative pl-16">
            {/* Phase Node */}
            <div className={`absolute left-2.5 top-0 w-8 h-8 rounded-full border-4 border-white dark:border-dark-bg bg-gradient-to-br ${phase.colorTheme} shadow-lg z-10`}></div>
            
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-center mb-1">
                   <h3 className={`text-lg font-bold bg-gradient-to-r ${phase.colorTheme} bg-clip-text text-transparent`}>{phase.title}</h3>
                   <span className="text-xs font-bold text-gray-400">{Math.round(phase.progressPercentage)}% Done</span>
               </div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{phase.description}</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.steps.map(step => {
                    const isCompleted = step.status === 'completed';
                    
                    const Content = (
                        <>
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted ? 'bg-green-500 text-white scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          }`}>
                            {isCompleted ? <IconCheck className="w-3 h-3"/> : <span className="w-2 h-2 rounded-full bg-gray-400"></span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div className={`text-sm font-bold ${isCompleted ? 'text-gray-900 dark:text-white line-through decoration-gray-400' : 'text-gray-900 dark:text-white'}`}>{step.title}</div>
                                {!isCompleted && (
                                    <IconPlay className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400 bg-white dark:bg-dark-surface px-1.5 py-0.5 rounded border border-gray-100 dark:border-dark-border">{step.type}</span>
                              <span className="text-xs text-gray-500">{step.durationEstimate}</span>
                            </div>
                          </div>
                        </>
                    );

                    return (
                        <Link 
                            to={step.deepLink} 
                            key={step.id} 
                            className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                                isCompleted 
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 shadow-sm' 
                                : 'bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-800'
                            }`}
                        >
                            {Content}
                        </Link>
                    );
                  })}
               </div>
            </div>
          </div>
        ))}
        
        {/* End Node */}
        <div className="relative pl-16">
           <div className="absolute left-2 top-0 w-9 h-9 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg z-10 border-4 border-white dark:border-dark-bg">
             <IconTrophy className="w-4 h-4" />
           </div>
           <div className="py-1">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">Goal Achieved</h3>
             <p className="text-gray-500 dark:text-gray-400">Ready for Senior Interviews</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default RoadmapPage;
