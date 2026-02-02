
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconCheck, IconTarget, IconTrophy, IconBriefcase, IconCode, IconRefresh, IconPlay, IconMap, IconSparkles, IconLock, IconChevronLeft, IconChevronRight } from '@/components/Icons';
import { RoadmapUI, RoadmapVariant, RoadmapGenerationInput } from '../model/types';
import { roadmapService, SelectVariantParams } from '../api/roadmapService';
import { AuthContext } from '@/components/Layout';
import { storage } from '@/lib/storage';
import { createLogger } from '@/lib/logger';
import { useUITranslation } from '@/contexts/LanguageContext';
import { RoadmapVariantCard } from './components/RoadmapVariantCard';

const log = createLogger('Roadmap');

// ============================================================================
// Types for Extended Wizard
// ============================================================================

interface WizardState {
  // Step 1: Known languages (multi-select)
  knownLanguages: string[];
  yearsOfExperience: number;
  // Step 2: Interests (multi-select)
  interests: string[];
  // Step 3: Goal
  goal: 'first-job' | 'senior' | 'startup' | 'master-skill' | '';
  // Step 4: Time commitment
  hoursPerWeek: number;
  targetMonths: number;
}

const initialWizardState: WizardState = {
  knownLanguages: [],
  yearsOfExperience: 0,
  interests: [],
  goal: '',
  hoursPerWeek: 10,
  targetMonths: 6,
};

// ============================================================================
// Wizard Options
// ============================================================================

const LANGUAGE_OPTIONS = [
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'go', label: 'Go', icon: '🐹' },
  { id: 'csharp', label: 'C#', icon: '💜' },
  { id: 'cpp', label: 'C/C++', icon: '⚙️' },
  { id: 'rust', label: 'Rust', icon: '🦀' },
  { id: 'ruby', label: 'Ruby', icon: '💎' },
  { id: 'php', label: 'PHP', icon: '🐘' },
  { id: 'kotlin', label: 'Kotlin', icon: '🟣' },
  { id: 'swift', label: 'Swift', icon: '🍎' },
];

const EXPERIENCE_OPTIONS = [
  { id: 0, label: 'No experience', desc: 'Just starting out' },
  { id: 1, label: '< 1 year', desc: 'Beginner' },
  { id: 2, label: '1-2 years', desc: 'Junior level' },
  { id: 3, label: '3-5 years', desc: 'Mid level' },
  { id: 5, label: '5+ years', desc: 'Senior level' },
];

const INTEREST_OPTIONS = [
  { id: 'backend', label: 'Backend Development', icon: '🔧', desc: 'APIs, databases, servers' },
  { id: 'go', label: 'Go Programming', icon: '🐹', desc: 'Concurrency, microservices' },
  { id: 'java', label: 'Java Ecosystem', icon: '☕', desc: 'Spring, enterprise' },
  { id: 'python', label: 'Python & Data', icon: '🐍', desc: 'ML, analysis, automation' },
  { id: 'ai-ml', label: 'AI & Machine Learning', icon: '🤖', desc: 'Deep learning, LLMs' },
  { id: 'algorithms', label: 'Algorithms & DS', icon: '🧮', desc: 'Problem solving, interviews' },
  { id: 'software-design', label: 'Software Design', icon: '🏗️', desc: 'SOLID, patterns, architecture' },
  { id: 'devops', label: 'DevOps & Cloud', icon: '☁️', desc: 'CI/CD, containers, infra' },
];

const GOAL_OPTIONS = [
  { id: 'first-job', label: 'Find a Job', icon: '💼', desc: 'Interview prep, portfolio, market-ready skills', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'senior', label: 'Reach Senior Level', icon: '📈', desc: 'Architecture, leadership, best practices', gradient: 'from-emerald-400 to-green-500' },
  { id: 'startup', label: 'Build a Startup', icon: '🚀', desc: 'Full-stack skills, MVP development', gradient: 'from-orange-400 to-red-500' },
  { id: 'master-skill', label: 'Master a Skill', icon: '🎯', desc: 'Deep expertise in specific area', gradient: 'from-purple-400 to-pink-500' },
];

const HOURS_OPTIONS = [
  { id: 5, label: '5 hrs/week', desc: 'Light pace' },
  { id: 10, label: '10 hrs/week', desc: 'Steady' },
  { id: 15, label: '15 hrs/week', desc: 'Focused' },
  { id: 20, label: '20+ hrs/week', desc: 'Intensive' },
];

const MONTHS_OPTIONS = [
  { id: 3, label: '3 months', desc: 'Sprint' },
  { id: 6, label: '6 months', desc: 'Standard' },
  { id: 9, label: '9 months', desc: 'Thorough' },
  { id: 12, label: '12 months', desc: 'Comprehensive' },
];

// ============================================================================
// LocalStorage Keys for Wizard State Persistence
// ============================================================================
const WIZARD_STORAGE_KEY = 'practix_roadmap_wizard';

interface PersistedWizardState {
  wizardState: WizardState;
  wizardStep: number;
  timestamp: number;
}

const saveWizardToStorage = (state: WizardState, step: number) => {
  try {
    const data: PersistedWizardState = {
      wizardState: state,
      wizardStep: step,
      timestamp: Date.now(),
    };
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage might be full or disabled
  }
};

const loadWizardFromStorage = (): PersistedWizardState | null => {
  try {
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!saved) return null;

    const data: PersistedWizardState = JSON.parse(saved);
    // Expire after 24 hours
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const clearWizardStorage = () => {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

// ============================================================================
// Intro Section
// ============================================================================

interface RoadmapIntroProps {
  onStart: () => void;
  onResume?: () => void;
  hasProgress?: boolean;
}

const RoadmapIntro = ({ onStart, onResume, hasProgress }: RoadmapIntroProps) => {
  const { tUI } = useUITranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <IconMap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
          {tUI('roadmap.introTitle')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-lg mx-auto">
          {tUI('roadmap.introDescription')}
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <IconSparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{tUI('roadmap.featureAI')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tUI('roadmap.featureAIDesc')}</p>
          </div>
          <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{tUI('roadmap.featurePersonal')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tUI('roadmap.featurePersonalDesc')}</p>
          </div>
          <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <IconTrophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{tUI('roadmap.featureProgress')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tUI('roadmap.featureProgressDesc')}</p>
          </div>
        </div>

        {/* Resume banner if there's saved progress */}
        {hasProgress && onResume && (
          <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
            <p className="text-sm text-brand-700 dark:text-brand-300 mb-3">
              {tUI('roadmap.resumeProgress') || 'You have unfinished progress. Would you like to continue?'}
            </p>
            <button
              onClick={onResume}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-sm transition-colors"
            >
              {tUI('roadmap.resumeButton') || 'Resume Wizard'}
            </button>
          </div>
        )}

        <button
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all transform hover:-translate-y-0.5"
        >
          {hasProgress ? (tUI('roadmap.startOver') || 'Start Over') : tUI('roadmap.startButton')}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const RoadmapPage = () => {
  const { user } = useContext(AuthContext);
  const { tUI } = useUITranslation();
  const navigate = useNavigate();

  // State - load from localStorage if available
  const [step, setStep] = useState<'intro' | 'wizard' | 'generating' | 'variants' | 'loading' | 'result'>('loading');
  const [wizardStep, setWizardStep] = useState(() => {
    const saved = loadWizardFromStorage();
    return saved?.wizardStep ?? 0;
  });
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    const saved = loadWizardFromStorage();
    return saved?.wizardState ?? initialWizardState;
  });
  const [hasRestoredWizard, setHasRestoredWizard] = useState(false);
  const [variants, setVariants] = useState<RoadmapVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<RoadmapVariant | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapUI | null>(null);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  // Save wizard state to localStorage when it changes
  useEffect(() => {
    if (step === 'wizard') {
      saveWizardToStorage(wizardState, wizardStep);
    }
  }, [wizardState, wizardStep, step]);

  // Check for existing roadmap on mount
  useEffect(() => {
    const checkExistingRoadmap = async () => {
      if (!user) {
        // Check if there's saved wizard progress for non-logged in user
        const saved = loadWizardFromStorage();
        if (saved && saved.wizardStep > 0) {
          setHasRestoredWizard(true);
        }
        setStep('intro');
        return;
      }

      try {
        const existing = await roadmapService.getUserRoadmap();
        if (existing) {
          setRoadmap(existing);
          clearWizardStorage(); // Clear saved wizard if roadmap exists
          setStep('result');
        } else {
          // Check if there's saved wizard progress
          const saved = loadWizardFromStorage();
          if (saved && saved.wizardStep > 0) {
            setHasRestoredWizard(true);
            setStep('wizard'); // Resume wizard
          } else {
            setStep('intro');
          }
        }
      } catch (e) {
        log.error('Failed to load roadmap', e);
        setStep('intro');
      }
    };

    checkExistingRoadmap();
  }, [user]);

  // ============================================================================
  // Wizard Navigation
  // ============================================================================

  const WIZARD_STEPS = [
    { id: 'languages', title: 'Your Background', subtitle: 'Select languages you know' },
    { id: 'experience', title: 'Experience Level', subtitle: 'How long have you been coding?' },
    { id: 'interests', title: 'Your Interests', subtitle: 'What do you want to learn?' },
    { id: 'goal', title: 'Your Goal', subtitle: 'What do you want to achieve?' },
    { id: 'time', title: 'Time Commitment', subtitle: 'How much time can you dedicate?' },
  ];

  const canProceed = () => {
    switch (wizardStep) {
      case 0: return true; // Languages can be empty (beginner)
      case 1: return true; // Experience is pre-filled
      case 2: return wizardState.interests.length > 0;
      case 3: return wizardState.goal !== '';
      case 4: return true; // Time has defaults
      default: return false;
    }
  };

  const handleNext = () => {
    if (wizardStep < WIZARD_STEPS.length - 1) {
      setWizardStep(prev => prev + 1);
    } else {
      // Start generation
      startVariantGeneration();
    }
  };

  const handleBack = () => {
    if (wizardStep > 0) {
      setWizardStep(prev => prev - 1);
    }
  };

  const toggleLanguage = (langId: string) => {
    setWizardState(prev => ({
      ...prev,
      knownLanguages: prev.knownLanguages.includes(langId)
        ? prev.knownLanguages.filter(l => l !== langId)
        : [...prev.knownLanguages, langId],
    }));
  };

  const toggleInterest = (interestId: string) => {
    setWizardState(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  // ============================================================================
  // Generation Flow
  // ============================================================================

  const startVariantGeneration = async () => {
    setStep('generating');
    setError(null);

    const phases = [
      'Analyzing your profile...',
      'Scanning available courses...',
      'Matching tasks to your goals...',
      'Generating personalized paths...',
      'Preparing variants...',
    ];

    for (let i = 0; i < phases.length; i++) {
      setLoadingText(phases[i]);
      setLoadingProgress((i + 1) * (100 / phases.length));
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const input: RoadmapGenerationInput = {
        knownLanguages: wizardState.knownLanguages,
        yearsOfExperience: wizardState.yearsOfExperience,
        interests: wizardState.interests,
        goal: wizardState.goal as RoadmapGenerationInput['goal'],
        hoursPerWeek: wizardState.hoursPerWeek,
        targetMonths: wizardState.targetMonths,
      };

      const response = await roadmapService.generateVariants(input);
      setVariants(response.variants);
      setStep('variants');
    } catch (e: unknown) {
      log.error('Failed to generate variants', e);
      if (e && typeof e === 'object' && 'status' in e && e.status === 403) {
        setError('Regeneration requires Premium. Upgrade to create unlimited personalized roadmaps.');
      } else {
        setError('Failed to generate roadmap variants. Please try again.');
      }
      setStep('wizard');
    }
  };

  const handleVariantSelect = (variant: RoadmapVariant) => {
    setSelectedVariant(variant);
  };

  const confirmVariantSelection = async () => {
    if (!selectedVariant) return;

    setStep('loading');
    setLoadingText('Creating your roadmap...');
    setLoadingProgress(50);

    try {
      const params: SelectVariantParams = {
        variantId: selectedVariant.id,
        name: selectedVariant.name,
        description: selectedVariant.description,
        totalTasks: selectedVariant.totalTasks,
        estimatedHours: selectedVariant.estimatedHours,
        estimatedMonths: selectedVariant.estimatedMonths,
        targetRole: selectedVariant.targetRole,
        difficulty: selectedVariant.difficulty,
        phases: selectedVariant.phases || [],
      };

      const result = await roadmapService.selectVariant(params);
      setRoadmap(result);
      setLoadingProgress(100);
      clearWizardStorage(); // Clear saved wizard state on success
      setStep('result');
    } catch (e) {
      log.error('Failed to select variant', e);
      setError('Failed to create roadmap. Please try again.');
      setStep('variants');
    }
  };

  const handleRegenerate = async () => {
    if (!roadmap?.canRegenerate && !roadmap?.isPremium) {
      setShowRegenerateModal(true);
      return;
    }
    setStep('wizard');
    setWizardStep(0);
    setWizardState(initialWizardState);
    setVariants([]);
    setSelectedVariant(null);
  };

  const handleRegeneratePurchase = () => {
    // TODO: Integrate with payment system
    // For now, redirect to premium page
    window.location.href = '/premium';
  };

  const reset = async () => {
    if (user) {
      try {
        await roadmapService.deleteRoadmap();
      } catch (e) {
        log.error('Failed to delete roadmap', e);
      }
    }
    clearWizardStorage(); // Clear saved wizard state
    setStep('intro');
    setWizardStep(0);
    setWizardState(initialWizardState);
    setRoadmap(null);
    setVariants([]);
    setSelectedVariant(null);
    setHasRestoredWizard(false);
  };

  // ============================================================================
  // Render: Intro
  // ============================================================================

  const handleStartWizard = (startFresh = false) => {
    if (!user) {
      // Redirect to login with return URL to roadmap page
      navigate('/login', { state: { from: { pathname: '/roadmap' } } });
      return;
    }
    if (startFresh) {
      // Clear any saved progress and start fresh
      clearWizardStorage();
      setWizardStep(0);
      setWizardState(initialWizardState);
      setHasRestoredWizard(false);
    }
    setStep('wizard');
  };

  const handleResumeWizard = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/roadmap' } } });
      return;
    }
    // Just switch to wizard step - state is already loaded from localStorage
    setStep('wizard');
  };

  if (step === 'intro') {
    return (
      <RoadmapIntro
        onStart={() => handleStartWizard(hasRestoredWizard)} // Start fresh if there was progress
        onResume={handleResumeWizard}
        hasProgress={hasRestoredWizard}
      />
    );
  }

  // ============================================================================
  // Render: Wizard
  // ============================================================================

  if (step === 'wizard') {
    const currentStep = WIZARD_STEPS[wizardStep];

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-3xl mx-auto px-4">
        <div className="w-full bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-xl">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Progress header */}
          <div className="mb-8 text-center">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">
              Step {wizardStep + 1} of {WIZARD_STEPS.length}
            </span>
            <div className="w-full bg-gray-100 dark:bg-dark-bg h-1.5 mt-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
                style={{ width: `${((wizardStep + 1) / WIZARD_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
              {currentStep.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{currentStep.subtitle}</p>
          </div>

          {/* Step content */}
          {wizardStep === 0 && (
            <div>
              <p className="text-center text-sm text-gray-500 mb-4">Select all that apply (or skip if you're a complete beginner)</p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {LANGUAGE_OPTIONS.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => toggleLanguage(lang.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      wizardState.knownLanguages.includes(lang.id)
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-dark-border hover:border-brand-300'
                    }`}
                  >
                    <span className="text-2xl">{lang.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lang.label}</span>
                    {wizardState.knownLanguages.includes(lang.id) && (
                      <IconCheck className="w-4 h-4 text-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXPERIENCE_OPTIONS.map(exp => (
                <button
                  key={exp.id}
                  onClick={() => setWizardState(prev => ({ ...prev, yearsOfExperience: exp.id }))}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                    wizardState.yearsOfExperience === exp.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-dark-border hover:border-brand-300'
                  }`}
                >
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{exp.label}</span>
                  <span className="text-sm text-gray-500">{exp.desc}</span>
                </button>
              ))}
            </div>
          )}

          {wizardStep === 2 && (
            <div>
              <p className="text-center text-sm text-gray-500 mb-4">Select at least one area of interest</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTEREST_OPTIONS.map(interest => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      wizardState.interests.includes(interest.id)
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-dark-border hover:border-brand-300'
                    }`}
                  >
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{interest.label}</span>
                    <span className="text-xs text-gray-500 text-center">{interest.desc}</span>
                    {wizardState.interests.includes(interest.id) && (
                      <IconCheck className="w-4 h-4 text-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="grid grid-cols-2 gap-4">
              {GOAL_OPTIONS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setWizardState(prev => ({ ...prev, goal: goal.id as WizardState['goal'] }))}
                  className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    wizardState.goal === goal.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-dark-border hover:border-brand-300'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.gradient} flex items-center justify-center text-2xl shadow-md`}>
                    {goal.icon}
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{goal.label}</span>
                  <span className="text-xs text-gray-500 text-center">{goal.desc}</span>
                  {wizardState.goal === goal.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                      <IconCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-6">
              {/* Hours per week */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Hours per week</h3>
                <div className="grid grid-cols-4 gap-3">
                  {HOURS_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setWizardState(prev => ({ ...prev, hoursPerWeek: opt.id }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        wizardState.hoursPerWeek === opt.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-gray-200 dark:border-dark-border hover:border-brand-300'
                      }`}
                    >
                      <span className="font-bold text-gray-800 dark:text-gray-200">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target months */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Target timeline</h3>
                <div className="grid grid-cols-4 gap-3">
                  {MONTHS_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setWizardState(prev => ({ ...prev, targetMonths: opt.id }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        wizardState.targetMonths === opt.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-gray-200 dark:border-dark-border hover:border-brand-300'
                      }`}
                    >
                      <span className="font-bold text-gray-800 dark:text-gray-200">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={wizardStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                wizardStep === 0
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IconChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-gray-200 dark:bg-dark-bg text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              {wizardStep === WIZARD_STEPS.length - 1 ? 'Generate Roadmaps' : 'Continue'}
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Generating
  // ============================================================================

  if (step === 'generating' || step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="w-full max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-dark-border rounded-full opacity-20"></div>
            <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            {loadingProgress > 0 && (
              <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl text-brand-500 animate-pulse">
                {Math.round(loadingProgress)}%
              </div>
            )}
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300">
            {loadingText}
          </h2>
          {loadingProgress > 0 && (
            <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden mt-6">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Variant Selection
  // ============================================================================

  if (step === 'variants') {
    return (
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Path
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We've generated {variants.length} personalized roadmaps based on your goals
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Variant cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {variants.map(variant => (
            <RoadmapVariantCard
              key={variant.id}
              variant={variant}
              isSelected={selectedVariant?.id === variant.id}
              onSelect={handleVariantSelect}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setStep('wizard');
              setWizardStep(0);
            }}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Adjust Preferences
          </button>

          <button
            onClick={confirmVariantSelection}
            disabled={!selectedVariant}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              selectedVariant
                ? 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-gray-200 dark:bg-dark-bg text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            Start {selectedVariant?.name || 'Selected'} Path →
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Result (Roadmap View)
  // ============================================================================

  const canRegenerate = roadmap?.canRegenerate ?? true;
  const isPremium = roadmap?.isPremium ?? false;

  return (
    <>
      {/* Regenerate Payment Modal */}
      {showRegenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowRegenerateModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowRegenerateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-500/25">
                  <IconRefresh className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tUI('roadmap.regenerateModalTitle') || 'Regenerate Your Roadmap'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tUI('roadmap.regenerateModalDesc') || 'Create a new personalized learning path based on updated preferences'}
                </p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 dark:bg-dark-bg rounded-2xl p-6 mb-6 text-center">
                <div className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-1">
                  $4.99
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {tUI('roadmap.oneTimePayment') || 'One-time payment'}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {tUI('roadmap.regenerateFeature1') || 'AI-powered personalized path generation'}
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {tUI('roadmap.regenerateFeature2') || 'Choose from multiple path variants'}
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {tUI('roadmap.regenerateFeature3') || 'Adjust goals and time commitments'}
                </li>
              </ul>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleRegeneratePurchase}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all"
                >
                  {tUI('roadmap.purchaseRegenerate') || 'Purchase Regeneration'}
                </button>
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {tUI('common.cancel') || 'Cancel'}
                </button>
              </div>

              {/* Premium upsell */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {tUI('roadmap.unlimitedWith') || 'Want unlimited regenerations?'}
                </p>
                <Link
                  to="/premium"
                  className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors"
                >
                  {tUI('roadmap.upgradeToPremium') || 'Upgrade to Premium →'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto pb-12">
      {/* Premium regeneration gate */}
      {!canRegenerate && !isPremium && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <IconLock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-amber-800 dark:text-amber-200">
                {tUI('roadmap.regeneratePremiumTitle') || 'Regeneration requires Premium'}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {tUI('roadmap.regeneratePremiumDesc') || 'Upgrade to create unlimited personalized roadmaps'}
              </p>
            </div>
            <Link
              to="/premium"
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-lg text-sm whitespace-nowrap"
            >
              {tUI('common.upgrade') || 'Upgrade'}
            </Link>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            {tUI('roadmap.yourPersonalRoadmap') || 'Your Personal Roadmap'}
          </h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full uppercase">
              {roadmap?.roleTitle || roadmap?.role}
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase">
              {roadmap?.targetLevel || roadmap?.level}
            </span>
          </div>
        </div>
        <button
          onClick={handleRegenerate}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            canRegenerate || isPremium
              ? 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-brand-600'
              : 'bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500'
          }`}
        >
          {canRegenerate || isPremium ? (
            <>
              <IconRefresh className="w-4 h-4" /> {tUI('roadmap.regenerate') || 'Regenerate'}
            </>
          ) : (
            <>
              <IconLock className="w-4 h-4" /> {tUI('roadmap.regeneratePremium') || 'Regenerate (Premium)'}
            </>
          )}
        </button>
      </div>

      <div className="relative space-y-12">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-1 bg-gray-200 dark:bg-dark-border rounded-full"></div>

        {roadmap?.phases.map(phase => (
          <div key={phase.id} className="relative pl-16">
            {/* Phase Node */}
            <div
              className={`absolute left-2.5 top-0 w-8 h-8 rounded-full border-4 border-white dark:border-dark-bg bg-gradient-to-br ${phase.colorTheme} shadow-lg z-10`}
            />

            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-1">
                <h3 className={`text-lg font-bold bg-gradient-to-r ${phase.colorTheme} bg-clip-text text-transparent`}>
                  {phase.title}
                </h3>
                <span className="text-xs font-bold text-gray-400">
                  {Math.round(phase.progressPercentage || 0)}% Done
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{phase.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phase.steps.map(step => {
                  const isCompleted = step.status === 'completed';

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
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white scale-110'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <IconCheck className="w-3 h-3" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div
                            className={`text-sm font-bold ${
                              isCompleted
                                ? 'text-gray-900 dark:text-white line-through decoration-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {step.title}
                          </div>
                          {!isCompleted && (
                            <IconPlay className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400 bg-white dark:bg-dark-surface px-1.5 py-0.5 rounded border border-gray-100 dark:border-dark-border">
                            {step.type}
                          </span>
                          <span className="text-xs text-gray-500">{step.durationEstimate}</span>
                        </div>
                      </div>
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
            <p className="text-gray-500 dark:text-gray-400">Ready for {roadmap?.roleTitle || 'your next step'}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RoadmapPage;
