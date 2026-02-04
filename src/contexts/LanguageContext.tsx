import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { storage } from "../lib/storage";

export type Language = "en" | "ru" | "uz";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T extends TranslatableEntity>(
    entity: T | null | undefined,
  ) => TranslatedFields<T>;
}

// Entities that have translations field
interface TranslatableEntity {
  translations?: {
    ru?: Record<string, unknown>;
    uz?: Record<string, unknown>;
  } | null;
  [key: string]: unknown;
}

// Return type preserves the entity but with translated string fields
type TranslatedFields<T> = T;

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Get translated value for a specific field
function getTranslatedField<T>(
  entity: TranslatableEntity,
  field: string,
  language: Language,
): T {
  if (language === "en") {
    return entity[field] as T;
  }

  const translations = entity.translations;
  if (
    translations &&
    translations[language] &&
    translations[language][field] !== undefined
  ) {
    return translations[language][field] as T;
  }

  // Fallback to English (default field value)
  return entity[field] as T;
}

// Fields that should be translated
const TRANSLATABLE_FIELDS = [
  "title",
  "description",
  "hint1",
  "hint2",
  "solutionExplanation",
  "solutionCode",
  "whyItMatters",
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = storage.getLanguage();
      if (saved && ["en", "ru", "uz"].includes(saved)) {
        return saved as Language;
      }
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storage.setLanguage(lang);
  }, []);

  // Translation function that works with any entity having translations field
  const t = useCallback(
    <T extends TranslatableEntity>(
      entity: T | null | undefined,
    ): TranslatedFields<T> => {
      if (!entity) {
        return entity as TranslatedFields<T>;
      }

      // If language is English, return entity as-is (English is default)
      if (language === "en") {
        return entity as TranslatedFields<T>;
      }

      // Create a new object with translated fields
      const translated = { ...entity };

      for (const field of TRANSLATABLE_FIELDS) {
        if (field in entity) {
          (translated as Record<string, unknown>)[field] = getTranslatedField(
            entity,
            field,
            language,
          );
        }
      }

      return translated as TranslatedFields<T>;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// UI translations for static text
const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // ===================== NAVIGATION & LAYOUT =====================
    "nav.dashboard": "Dashboard",
    "nav.courses": "Courses",
    "nav.settings": "Settings",
    "nav.logout": "Sign Out",
    "nav.login": "Log In",
    "nav.roadmap": "Roadmap",
    "nav.analytics": "Analytics",
    "nav.payments": "Payments & Plans",
    "nav.myTasks": "My Tasks",
    "nav.learningSpace": "Learning Space",
    "nav.taskWorkspace": "Task Workspace",
    "nav.courseDetails": "Course Details",
    "nav.playground": "Playground",
    "nav.platform": "Platform",
    "nav.goPremium": "Premium",
    "nav.pro": "Pro",
    "nav.freePlan": "Free Plan",
    "nav.version": "v2.4.0 • Practix",
    "nav.admin": "Metrics",
    "nav.leaderboard": "Leaderboard",

    // ===================== DASHBOARD =====================
    "dashboard.welcomeTitle": "Welcome to Practix",
    "dashboard.welcomeDesc":
      "The ultimate platform to master Engineering. Java, Go, System Design, and Algorithms - all in one place.",
    "dashboard.browseCatalog": "Browse Catalog",
    "dashboard.pageTitle": "Dashboard",
    "dashboard.pageSubtitle": "Track your progress and keep the momentum.",
    "dashboard.currentStreak": "Current Streak",
    "dashboard.totalSolved": "Total Solved",
    "dashboard.thisWeek": "this week",
    "dashboard.hoursSpent": "Hours Spent",
    "dashboard.avgPerDay": "2.5h avg/day",
    "dashboard.globalRank": "Global Rank",
    "dashboard.topPercent": "Top",
    "dashboard.skillPoints": "Skill Points",
    "dashboard.maxStreak": "Max streak",
    "dashboard.submissions": "submissions",
    "dashboard.hours": "h",
    "dashboard.minutes": "m",
    "dashboard.level": "Level 14",
    "dashboard.activityOverview": "Activity Overview",
    "dashboard.last7Days": "Last 7 Days",
    "dashboard.last30Days": "Last 30 Days",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.pending": "Pending",
    "dashboard.completed": "Completed",
    "dashboard.score": "Score",
    "dashboard.activeCourses": "Your Active Courses",
    "dashboard.percentCompleted": "% Completed",
    "dashboard.days": "days",
    "dashboard.loginRequired": "Sign in to view your dashboard",
    "dashboard.loginRequiredDesc":
      "Track your progress, see your stats, and continue learning",
    "dashboard.noActivity": "No recent activity",
    "dashboard.startLearning": "Start learning →",

    // ===================== LEADERBOARD =====================
    "leaderboard.title": "Leaderboard",
    "leaderboard.subtitle": "Top coders ranked by XP",
    "leaderboard.top50": "Top 50 Coders",
    "leaderboard.empty": "No entries yet. Be the first!",
    "leaderboard.loginRequired": "Join the Competition",
    "leaderboard.loginRequiredDesc":
      "Sign in to see your ranking and compete with other coders.",
    "leaderboard.level": "Level",
    "leaderboard.xp": "XP",
    "leaderboard.tasks": "tasks",
    "leaderboard.you": "You",
    "leaderboard.dayStreak": "day streak",
    "leaderboard.badgesEarned": "badges earned",
    "leaderboard.progressToLevel": "Progress to Level",
    "leaderboard.streak": "Streak",

    // ===================== NOT FOUND =====================
    "notFound.title": "Page Not Found",
    "notFound.description":
      "The page you're looking for doesn't exist or has been moved.",
    "notFound.goHome": "Go to Dashboard",
    "notFound.browseCourses": "Browse Courses",

    // ===================== COURSES PAGE =====================
    "courses.title": "Learning Catalog",
    "courses.description":
      "Structured learning paths designed by principal engineers. Choose a language track to master its ecosystem, or dive into core computer science concepts.",
    "courses.allTracks": "All Tracks",
    "courses.filterGo": "Go",
    "courses.filterJava": "Java",
    "courses.filterAlgoDS": "Algo & DS",
    "courses.filterMathDS": "Math & DS",
    "courses.filterPatternsSE": "Patterns & SE",
    "courses.filterMlAi": "AI / ML",
    "courses.filterDesignPatterns": "Design Patterns",
    "courses.searchPlaceholder":
      "Search courses by name, topic, or description...",
    "courses.groupLanguages": "Languages",
    "courses.groupCsFundamentals": "CS Fundamentals",
    "courses.groupApplied": "Applied",
    "courses.languageTrack": "Language Track",
    "courses.csCore": "CS Core",
    "courses.designPatterns": "Design Patterns",
    "courses.softwareEng": "Software Eng",
    "courses.mlAi": "AI / ML",
    "courses.algoDs": "Algo & DS",
    "courses.mathDs": "Math & DS",
    "courses.topics": "Topics",
    "courses.duration": "Duration",
    "courses.inProgress": "In Progress",
    "courses.notStarted": "Not Started",
    "courses.resume": "Resume",
    "courses.startLearning": "Start Learning",
    "courses.loading": "Loading courses...",
    "courses.comingSoon": "Coming Soon",
    "courses.comingSoonDesc":
      "We are crafting new premium content for this category.",

    // ===================== COURSE DETAILS =====================
    "courseDetails.languageTrack": "Language Track",
    "courseDetails.csFundamental": "CS Fundamental",
    "courseDetails.modules": "Modules",
    "courseDetails.trackProgress": "Track Progress",
    "courseDetails.continueJourney": "Continue Journey",
    "courseDetails.coreCurriculum": "Core Curriculum",
    "courseDetails.frameworksLibs": "Frameworks & Libs",
    "courseDetails.interviewPrep": "Interview Prep",
    "courseDetails.capstoneProjects": "Capstone Projects",
    "courseDetails.curriculumModules": "Curriculum Modules",
    "courseDetails.noContent": "No content available for this section yet.",
    "courseDetails.topicsCount": "Topics",
    "courseDetails.done": "Done",
    "courseDetails.loading": "Loading Course Details...",
    "courseDetails.notFound": "Course not found.",
    "courseDetails.tasks": "Tasks",

    // ===================== TASK WORKSPACE =====================
    "task.runCode": "RUN CODE",
    "task.submit": "SUBMIT",
    "task.description": "Description",
    "task.results": "Results",
    "task.noRunYet": "Run your code to see results",
    "task.latestRun": "Latest Run",
    "task.loadCode": "Load code",
    "task.solution": "Solution",
    "task.aiTutor": "AI Tutor",
    "task.aiTutorPlaceholder": "Ask AI...",
    "task.aiTutorEmpty":
      "Ask for a hint, debugging help, or complexity analysis.",
    "task.aiTutorLocked": "Unlock Premium to chat with AI Tutor",
    "task.aiTutorLockedTitle": "AI Tutor Locked",
    "task.hints": "Hints",
    "task.hint": "Hint",
    "task.relatedTopics": "Related Topics",
    "task.solutionExplanation": "Solution Explanation",
    "task.solutionLocked": "Solution Locked",
    "task.solutionLockedDesc":
      "Upgrade to Premium to view the detailed solution explanation, code walkthrough, and real-world usage examples.",
    "task.unlockNow": "Unlock Now",
    "task.mobileTask": "Task",
    "task.mobileEditor": "Editor",
    "task.mobileTutor": "Tutor",
    "task.loadingEnv": "Loading Environment...",
    "task.main": "main",
    "task.submissions": "Submissions",
    "task.submissionHistory": "Submission History",
    "task.noSubmissions": "No submissions yet.",
    "task.runtime": "Runtime",
    "task.executionOutput": "Execution Output",
    "task.loadingEditor": "Loading Editor Engine...",
    "task.whyItMatters": "Why This Matters",
    "task.videoExplanation": "Video Explanation",
    "task.videoDesc": "Watch step-by-step solution walkthrough",
    "task.poweredByYoutube": "Powered by YouTube",
    "task.openNewTab": "Open in new tab ↗",
    "task.canonicalSolution": "Canonical Solution",
    "task.relatedConcepts": "Related Concepts",
    "task.testsPassedToast": "🎉 Tests Passed! Great job.",
    "task.score": "Score",
    "task.hint1": "Hint 1",
    "task.hint2": "Hint 2",
    "task.aiThinking": "Thinking...",
    "task.aiAskPlaceholder": "Ask AI...",
    "task.aiUnlockToChat": "Unlock Premium to chat",
    "task.prevTask": "Previous Task (Alt+Left)",
    "task.nextTask": "Next Task (Alt+Right)",
    "task.testsPassed": "tests passed",
    "task.allTestsPassed": "All tests passed!",
    "task.failedTests": "Failed Tests",
    "task.testInput": "Input",
    "task.expectedOutput": "Expected",
    "task.actualOutput": "Actual",
    "task.error": "Error",
    "task.runResults": "Run Results",
    "task.running": "Running...",
    "task.passed": "Passed",
    "task.failed": "Failed",
    "task.executingCode": "Executing code...",
    "task.errorDetails": "Error Details",
    "task.output": "Output",
    "task.expected": "Expected",
    "task.testResults": "Test Results",
    "task.resetCode": "Reset to initial code",
    "task.resetConfirm":
      "Reset to initial code? Your current code will be lost.",
    "task.reset": "Reset",
    "task.executionError": "Something went wrong",
    "task.executionErrorHint":
      "Please check your code and try again. If the problem persists, try again later.",

    // ===================== BUG REPORT =====================
    "bugReport.title": "Report a Bug",
    "bugReport.generalFeedback": "General Feedback",
    "bugReport.selectCategory": "What area has the issue?",
    "bugReport.categoryDescription": "Description",
    "bugReport.categorySolution": "Solution",
    "bugReport.categoryEditor": "Editor",
    "bugReport.categoryHints": "Hints",
    "bugReport.categoryAiTutor": "AI Tutor",
    "bugReport.categoryOther": "Other",
    "bugReport.severity": "How severe is this issue?",
    "bugReport.severityLow": "Low",
    "bugReport.severityLowDesc": "Minor inconvenience",
    "bugReport.severityMedium": "Medium",
    "bugReport.severityMediumDesc": "Affects learning experience",
    "bugReport.severityHigh": "High",
    "bugReport.severityHighDesc": "Cannot complete the task",
    "bugReport.issueTitle": "Brief summary",
    "bugReport.issueTitlePlaceholder": "e.g. Tests fail with correct solution",
    "bugReport.description": "Describe the issue",
    "bugReport.descriptionPlaceholder": "What happened? What did you expect?",
    "bugReport.submit": "Submit Report",
    "bugReport.fillAllFields": "Please fill all required fields",
    "bugReport.submitSuccess": "Bug report submitted successfully!",
    "bugReport.submitError": "Failed to submit bug report. Please try again.",

    // ===================== COMMON =====================
    "common.copy": "Copy",
    "common.copied": "Copied!",

    // ===================== EDITOR =====================
    "editor.settings": "Editor Settings",
    "editor.editorSettings": "Editor Settings",
    "editor.minimapHint": "Show code minimap on right side",
    "editor.vimHint": "Vim keyboard shortcuts (Advanced)",
    "editor.lineNumbersHint": "Show line numbers in gutter",
    "editor.fontFamily": "Font",
    "editor.autoSaveTitle": "Relax, you're in the cloud! ☁️",
    "editor.autoSaveMessage":
      "Your code auto-saves as you type. No Ctrl+S needed here!",
    "editor.gotIt": "Got it!",
    "editor.codeSaved": "Code saved",

    // ===================== TIMER =====================
    "timer.timeTools": "Time Tools",
    "timer.stopwatch": "Stopwatch",
    "timer.startStopwatch": "Start Stopwatch",
    "timer.timer": "Timer",
    "timer.pause": "Pause",
    "timer.resume": "Resume",
    "timer.reset": "Reset",
    "timer.openTimer": "Open Timer/Stopwatch",
    "timer.customTimer": "Custom",
    "timer.min": "min",
    "timer.sec": "sec",

    // ===================== DIFFICULTY =====================
    "difficulty.easy": "Easy",
    "difficulty.medium": "Medium",
    "difficulty.hard": "Hard",

    // ===================== AUTH PAGE =====================
    "auth.welcomeBack": "Welcome back",
    "auth.createAccount": "Create an account",
    "auth.resetPassword": "Reset Password",
    "auth.loginDesc": "Enter your credentials to access your workspace.",
    "auth.registerDesc": "Join thousands of engineers mastering their craft.",
    "auth.forgotDesc": "Enter your email to receive a reset link.",
    "auth.fullName": "Full Name",
    "auth.fullNamePlaceholder": "Alex Developer",
    "auth.email": "Email Address",
    "auth.emailPlaceholder": "alex@example.com",
    "auth.password": "Password",
    "auth.forgot": "Forgot?",
    "auth.signIn": "Sign In",
    "auth.createAccountBtn": "Create Account",
    "auth.sendResetLink": "Send Reset Link",
    "auth.orContinueWith": "Or continue with",
    "auth.github": "GitHub",
    "auth.noAccount": "Don't have an account yet?",
    "auth.signUp": "Sign up",
    "auth.haveAccount": "Already have an account?",
    "auth.logIn": "Log in",
    "auth.backToSignIn": "← Back to Sign In",
    "auth.resetLinkSent": "Password reset link sent to your email.",
    "auth.welcomeBackToast": "Welcome back",
    "auth.accountCreated": "Account created successfully!",
    "auth.connectionFailed": "Connection failed. Please check your internet.",
    "auth.loginRequired": "Login Required",
    "auth.loginRequiredDesc":
      "Sign in to access this feature and track your progress.",
    "auth.signInToContinue": "Sign In to Continue",
    "auth.hasAccount": "Already have an account?",

    // ===================== SETTINGS PAGE =====================
    "settings.title": "Settings",
    "settings.description":
      "Manage your profile, editor preferences, and security.",
    "settings.publicProfile": "Public Profile",
    "settings.editorAppearance": "Editor & Appearance",
    "settings.notifications": "Notifications",
    "settings.passwordSecurity": "Password & Security",
    "settings.uploadNew": "Upload New",
    "settings.avatarHelper": "JPG, GIF or PNG. Max size 800K.",
    "settings.fullName": "Full Name",
    "settings.username": "Username",
    "settings.bio": "Bio",
    "settings.bioPlaceholder": "Tell us about yourself...",
    "settings.editorConfig": "Editor Configuration",
    "settings.fontSize": "Font Size",
    "settings.minimap": "Minimap",
    "settings.minimapDesc":
      "Show a miniature map of the code on the right side.",
    "settings.vimBindings": "Vim Keybindings",
    "settings.vimDesc": "Enable Vim emulation for the code editor (Advanced).",
    "settings.lineNumbers": "Line Numbers",
    "settings.lineNumbersDesc": "Show line numbers in the gutter.",
    "settings.emailPrefs": "Email Preferences",
    "settings.weeklyDigest": "Weekly Digest",
    "settings.weeklyDigestDesc":
      "A summary of your progress and new challenges every Monday.",
    "settings.newCourses": "New Courses & Features",
    "settings.newCoursesDesc":
      "Be the first to know when we launch a new track.",
    "settings.marketing": "Marketing & Offers",
    "settings.marketingDesc": "Promotions and discounts for Premium plans.",
    "settings.securityAlerts": "Security Alerts",
    "settings.securityAlertsDesc":
      "Important alerts regarding your account security.",
    "settings.security": "Security",
    "settings.currentPassword": "Current Password",
    "settings.newPassword": "New Password",
    "settings.confirmPassword": "Confirm Password",
    "settings.updatePassword": "Update Password",
    "settings.twoFactor": "Two-Factor Authentication (2FA)",
    "settings.twoFactorDesc": "Add an extra layer of security to your account.",
    "settings.enable2FA": "Enable 2FA",
    "settings.saveChanges": "Save Changes",
    "settings.loginRequired": "Login to manage Settings",
    "settings.loginRequiredDesc":
      "Update your profile, change passwords, and manage notification preferences.",
    "settings.savedSuccess": "Settings saved successfully",
    "settings.savedFailed": "Failed to save settings",
    "settings.chooseAvatar": "Choose Avatar",
    "settings.presetAvatars": "Choose a preset avatar",
    "settings.avatarHelperNew": "Max 200KB. PNG, JPG, GIF",
    "settings.avatarTooLarge": "Image too large. Max 200KB.",
    "settings.avatarInvalidType": "Please select an image file.",
    "settings.avatarUpdated": "Avatar updated!",
    "settings.avatarUpdateFailed": "Failed to update avatar.",

    // ===================== PREMIUM PAGE =====================
    "premium.tagline": "Unlock Your Potential",
    "premium.title": "Invest in your career",
    "premium.description":
      "Get unlimited access to AI tutoring, system design masterclasses, and senior-level interview prep.",
    "premium.starter": "Starter",
    "premium.starterPrice": "$0",
    "premium.foreverFree": "Forever free",
    "premium.starterFeature1": "Access to Core Java/Go Tracks",
    "premium.starterFeature2": "Limited Daily Executions",
    "premium.starterFeature3": "No AI Tutor",
    "premium.starterFeature4": "No System Design Course",
    "premium.currentPlan": "Current Plan",
    "premium.professional": "Professional",
    "premium.proPrice": "$19",
    "premium.perMonth": "/mo",
    "premium.billedMonthly": "Billed monthly",
    "premium.mostPopular": "Most Popular",
    "premium.proFeature1": "Everything in Starter",
    "premium.proFeature2": "Practix AI Assistant (Unlimited)",
    "premium.proFeature3": "System Design & Arch Patterns",
    "premium.proFeature4": "Verified Certificates",
    "premium.activeSubscription": "Active Subscription",
    "premium.upgradeToPro": "Upgrade to Pro",
    "premium.subscriptionRequired": "Subscription Required",
    "premium.subscriptionRequiredDesc":
      "This task requires an active subscription. Purchase a subscription to unlock access to premium content.",
    "premium.purchaseSubscription": "View Plans",

    // ===================== MY TASKS PAGE =====================
    "myTasks.title": "My Tasks",
    "myTasks.subtitle": "Continue where you left off.",
    "myTasks.noActiveCourses": "No active courses",
    "myTasks.noActiveCoursesDesc":
      "You haven't started any courses yet. Visit the catalog to begin your journey.",
    "myTasks.browseCourses": "Browse Courses",
    "myTasks.loadingProgress": "Loading Progress...",
    "myTasks.continueLearning": "Continue Learning",
    "myTasks.percentCompleted": "% Completed",
    "myTasks.progress": "Progress",
    "myTasks.loginRequired": "Track Your Progress",
    "myTasks.loginRequiredDesc":
      "Sign in to track your learning progress and continue where you left off.",
    "myTasks.description": "Continue where you left off.",

    // ===================== ANALYTICS PAGE =====================
    "analytics.loginRequired": "View Your Analytics",
    "analytics.loginRequiredDesc":
      "Sign in to see your performance metrics, activity heatmaps, and skill growth.",
    "analytics.title": "Analytics",
    "analytics.subtitle":
      "Deep dive into your performance metrics and skill growth.",
    "analytics.weeklyActivity": "Weekly Activity",
    "analytics.yearlyContributions": "Yearly Contributions",
    "analytics.noActivityThisWeek": "No activity this week",
    "analytics.youAreOnFire": "You are on fire!",
    "analytics.tasksSolvedThisWeek": "{count} tasks solved this week.",
    "analytics.historicalData": "Historical data for the week of {dateRange}.",
    "analytics.totalSubmissions": "Total Submissions",
    "analytics.maxStreak": "Max Streak",
    "analytics.currentStreak": "Current Streak",
    "analytics.less": "Less",
    "analytics.more": "More",
    "analytics.completionRate": "Completion Rate",
    "analytics.avgRuntime": "Avg. Runtime",
    "analytics.totalXP": "Total XP",
    "analytics.loading": "Loading Analytics Engine...",
    "analytics.noActivity": "No activity",
    "analytics.tasksCompleted": "{count} tasks completed",
    // Day names for weekly chart
    "analytics.day.mon": "Mon",
    "analytics.day.tue": "Tue",
    "analytics.day.wed": "Wed",
    "analytics.day.thu": "Thu",
    "analytics.day.fri": "Fri",
    "analytics.day.sat": "Sat",
    "analytics.day.sun": "Sun",

    // ===================== ROADMAP PAGE =====================
    "roadmap.questionFocus": "What is your primary focus?",
    "roadmap.backendGo": "Backend (Go)",
    "roadmap.backendJava": "Backend (Java)",
    "roadmap.fullstack": "Fullstack",
    "roadmap.questionExperience": "What is your current experience?",
    "roadmap.junior": "Junior (0-2 yrs)",
    "roadmap.midLevel": "Mid-Level (3-5 yrs)",
    "roadmap.senior": "Senior (5+ yrs)",
    "roadmap.questionGoal": "What is your main goal?",
    "roadmap.landJob": "Land a New Job",
    "roadmap.getPromoted": "Get Promoted",
    "roadmap.masterSkill": "Master Specific Skill",
    "roadmap.stepOf": "Step {step} of 3",
    "roadmap.title": "Your Personal Roadmap",
    "roadmap.regenerate": "Regenerate",
    "roadmap.analyzingProfile": "Analyzing Profile...",
    "roadmap.scanningMarket": "Scanning Market Requirements...",
    "roadmap.mappingDeps": "Mapping Dependencies...",
    "roadmap.selectingResources": "Selecting Best Resources...",
    "roadmap.finalizing": "Finalizing Roadmap...",
    "roadmap.loading": "Loading Roadmap...",
    "roadmap.percentDone": "% Done",
    "roadmap.goalAchieved": "Goal Achieved",
    "roadmap.readyForInterviews": "Ready for Senior Interviews",
    "roadmap.introTitle": "Your Learning Path",
    "roadmap.introDescription":
      "Answer a few questions and our AI will create a personalized roadmap from 900+ coding tasks, tailored to your goals.",
    "roadmap.featureAI": "AI-Powered",
    "roadmap.featureAIDesc": "Smart task selection based on your profile",
    "roadmap.featurePersonal": "Personalized",
    "roadmap.featurePersonalDesc": "Tailored to your experience and goals",
    "roadmap.featureProgress": "Track Progress",
    "roadmap.featureProgressDesc": "Visual roadmap with completion tracking",
    "roadmap.interestsHint": "Select at least one area of interest",
    "roadmap.interestsError":
      "Please select at least one area of interest to continue",
    "roadmap.firstFree": "First generation FREE",
    "roadmap.regeneratePremium": "Regenerate with Premium",
    "roadmap.regeneratePremiumTitle": "Regeneration requires Premium",
    "roadmap.regeneratePremiumDesc":
      "Upgrade to create unlimited personalized roadmaps",
    "roadmap.yourPersonalRoadmap": "Your Personal Roadmap",
    "roadmap.startButton": "Create My Roadmap",
    "roadmap.questionFocusDesc": "Choose your primary learning direction",
    "roadmap.questionHours": "How much time can you dedicate weekly?",
    // NEW: Variant selection UI
    "roadmap.chooseYourPath": "Choose Your Path",
    "roadmap.variantsGenerated":
      "We've generated {count} personalized roadmaps based on your goals",
    "roadmap.adjustPreferences": "Adjust Preferences",
    "roadmap.startPath": "Start {name} Path",
    "roadmap.recommended": "Recommended",
    "roadmap.tasks": "Tasks",
    "roadmap.expectedSalary": "Expected Salary",
    "roadmap.topics": "Topics",
    "roadmap.fromCourses": "From Courses",
    "roadmap.firstTasks": "First Tasks",
    "roadmap.clickToSelect": "Click to select",
    "roadmap.selected": "Selected",
    "roadmap.generateRoadmaps": "Generate Roadmaps",
    "roadmap.wizardStep1Title": "Your Background",
    "roadmap.wizardStep1Subtitle": "Select languages you know",
    "roadmap.wizardStep2Title": "Experience Level",
    "roadmap.wizardStep2Subtitle": "How long have you been coding?",
    "roadmap.wizardStep3Title": "Your Interests",
    "roadmap.wizardStep3Subtitle": "What do you want to learn?",
    "roadmap.wizardStep4Title": "Your Goal",
    "roadmap.wizardStep4Subtitle": "What do you want to achieve?",
    "roadmap.wizardStep5Title": "Time Commitment",
    "roadmap.wizardStep5Subtitle": "How much time can you dedicate?",

    // ===================== PAYMENTS PAGE =====================
    "payments.title": "Billing & Payments",
    "payments.description":
      "Manage your subscription and view payment history.",
    "payments.currentPlan": "Current Plan",
    "payments.professional": "Professional",
    "payments.activeDesc":
      "Your active subscription renews on {date}. You have full access to all features.",
    "payments.freeStarter": "Free Starter",
    "payments.freeDesc":
      "You are currently on the free plan. Upgrade to unlock the full potential of Practix.",
    "payments.manageSubscription": "Manage Subscription",
    "payments.upgradePlan": "Upgrade Plan",
    "payments.paymentMethods": "Payment Methods",
    "payments.visa": "VISA",
    "payments.cardEnding": "Visa ending in {last4}",
    "payments.expires": "Expires {date}",
    "payments.edit": "Edit",
    "payments.addPaymentMethod": "Add Payment Method",
    "payments.paymentHistory": "Payment History",
    "payments.invoiceId": "Invoice ID",
    "payments.date": "Date",
    "payments.descriptionCol": "Description",
    "payments.amount": "Amount",
    "payments.status": "Status",
    "payments.loadingHistory": "Loading history...",
    "payments.download": "Download",

    // ===================== ADMIN DASHBOARD =====================
    "admin.title": "Metrics",
    "admin.subtitle": "Platform statistics and insights.",
    "admin.totalUsers": "Total Users",
    "admin.newUsers": "New Users (30d)",
    "admin.activeUsers": "Active Users (Monthly)",
    "admin.totalSubmissions": "Total Submissions",
    "admin.activeSubscriptions": "Active Subscriptions",
    "admin.thisMonth": "this month",
    "admin.subscriptionsByPlan": "Subscriptions by Plan",
    "admin.globalAccess": "Global Access",
    "admin.courseAccess": "Course Access",
    "admin.subscribers": "subscribers",
    "admin.showMore": "Show more",
    "admin.showLess": "Show less",
    "admin.noActiveSubscriptions": "No active subscriptions",
    "admin.monthlyRevenue": "Monthly Revenue",
    "admin.estimatedMonthly": "Estimated monthly",
    "admin.submissionsByStatus": "Submissions by Status",
    "admin.noSubmissions": "No submissions yet",
    "admin.submissionsByDay": "Submissions by Day (Last 30 Days)",
    "admin.coursePopularity": "Course Popularity (Enrollments)",
    "admin.noEnrollmentData": "No enrollment data available",
    "admin.topCoursesByCompletion": "Top Courses by Completion Rate",
    "admin.course": "Course",
    "admin.completions": "Completions",
    "admin.rate": "Rate",
    "admin.hardestTasks": "Hardest Tasks (Lowest Pass Rate)",
    "admin.task": "Task",
    "admin.submissions": "Submissions",
    "admin.passRate": "Pass Rate",
    "admin.loginRequired": "Login Required",
    "admin.loginRequiredDesc": "Please login to access the admin dashboard.",
    "admin.loading": "Loading dashboard...",
    "admin.statusPassed": "Passed",
    "admin.statusFailed": "Failed",
    "admin.statusError": "Error",
    "admin.statusTimeout": "Timeout",
    "admin.statusCompileError": "Compile Error",
    "admin.statusPending": "Pending",
    "admin.enrolled": "enrolled",
    "admin.completed": "completed",

    // AI Settings
    "admin.aiSettings.title": "AI Tutor Settings",
    "admin.aiSettings.subtitle": "Configure daily request limits for AI Tutor",
    "admin.aiSettings.enabled": "AI Tutor Enabled",
    "admin.aiSettings.disabled": "AI Tutor Disabled",
    "admin.aiSettings.dailyLimits": "Daily Request Limits",
    "admin.aiSettings.freeTier": "Free Tier",
    "admin.aiSettings.freeTierDesc": "Users without any subscription",
    "admin.aiSettings.courseTier": "Course Tier",
    "admin.aiSettings.courseTierDesc": "Users with single course subscription",
    "admin.aiSettings.premiumTier": "Premium Tier",
    "admin.aiSettings.premiumTierDesc": "Users with global premium access",
    "admin.aiSettings.promptEngineeringTier": "Prompt Engineering",
    "admin.aiSettings.promptEngineeringTierDesc": "Special limit for PE course",
    "admin.aiSettings.saveChanges": "Save Changes",
    "admin.aiSettings.saving": "Saving...",
    "admin.aiSettings.saveSuccess": "Settings saved successfully!",
    "admin.aiSettings.loadError": "Failed to load AI settings",
    "admin.aiSettings.saveError": "Failed to save AI settings",

    // Bug Reports
    "admin.bugReports.title": "Bug Reports",
    "admin.bugReports.subtitle": "User-submitted bug reports",
    "admin.bugReports.allStatuses": "All Statuses",
    "admin.bugReports.noReports": "No bug reports found",
    "admin.bugReports.loadError": "Failed to load bug reports",
    "admin.bugReports.description": "Description",
    "admin.bugReports.relatedTask": "Related Task",
    "admin.bugReports.metadata": "Metadata",
    "admin.bugReports.status.open": "Open",
    "admin.bugReports.status.in-progress": "In Progress",
    "admin.bugReports.status.resolved": "Resolved",
    "admin.bugReports.status.closed": "Closed",
    "admin.bugReports.status.wont-fix": "Won't Fix",

    // User Search
    "admin.userSearch.title": "User Search",
    "admin.userSearch.subtitle": "Search users by email or name",
    "admin.userSearch.placeholder": "Enter email or name...",
    "admin.userSearch.search": "Search",
    "admin.userSearch.minChars": "Enter at least 2 characters",
    "admin.userSearch.searchError": "Failed to search users",
    "admin.userSearch.noResults": "No users found",
    "admin.userSearch.noName": "No name",
    "admin.userSearch.registered": "Registered",
    "admin.userSearch.lastActive": "Last active",
    "admin.userSearch.submissions": "submissions",
    "admin.userSearch.courses": "courses",
    "admin.userSearch.hint": "Search for users by email or name",
    "admin.userSearch.banned": "Banned",
    "admin.userSearch.ban": "Ban",
    "admin.userSearch.unban": "Unban",
    "admin.userSearch.banReason": "Ban reason",
    "admin.userSearch.banError": "Failed to ban user",
    "admin.userSearch.unbanError": "Failed to unban user",
    "admin.userSearch.banModalTitle": "Ban User",
    "admin.userSearch.banModalDesc": "You are about to ban user",
    "admin.userSearch.banReasonLabel": "Reason for ban",
    "admin.userSearch.banReasonPlaceholder":
      "Enter reason for banning this user...",
    "admin.userSearch.confirmBan": "Ban User",

    // ===================== ADMIN PAYMENTS =====================
    "admin.payments.title": "Payments Management",
    "admin.payments.subtitle": "Manage payments, subscriptions and revenue",
    "admin.payments.tab.revenue": "Revenue",
    "admin.payments.tab.subscriptions": "Subscriptions",
    "admin.payments.tab.payments": "Payments",
    "admin.payments.loadError": "Failed to load data",
    "admin.payments.thisMonth": "This Month",
    "admin.payments.lastMonth": "Last Month",
    "admin.payments.totalRevenue": "Total Revenue",
    "admin.payments.refunded": "Refunded",
    "admin.payments.transactions": "transactions",
    "admin.payments.byProvider": "By Provider",
    "admin.payments.noData": "No data available",
    "admin.payments.oneTimePurchases": "One-time Purchases",
    "admin.payments.purchases": "purchases",
    "admin.payments.allStatuses": "All Statuses",
    "admin.payments.allProviders": "All Providers",
    "admin.payments.total": "Total",
    "admin.payments.refund": "Refund",
    "admin.payments.noPayments": "No payments found",
    "admin.payments.expires": "Expires",
    "admin.payments.payments": "payments",
    "admin.payments.extend": "Extend",
    "admin.payments.cancelSub": "Cancel",
    "admin.payments.noSubscriptions": "No subscriptions found",
    "admin.payments.confirmCancel":
      "Are you sure you want to cancel subscription for",
    "admin.payments.refundError": "Failed to refund payment",
    "admin.payments.extendError": "Failed to extend subscription",
    "admin.payments.cancelError": "Failed to cancel subscription",
    "admin.payments.refundModalTitle": "Refund Payment",
    "admin.payments.refundModalDesc": "You are about to refund",
    "admin.payments.for": "for",
    "admin.payments.refundReasonLabel": "Reason for refund",
    "admin.payments.refundReasonPlaceholder": "Enter reason for refund...",
    "admin.payments.confirmRefund": "Refund Payment",
    "admin.payments.extendModalTitle": "Extend Subscription",
    "admin.payments.extendModalDesc": "Extend subscription for",
    "admin.payments.extendDaysLabel": "Days to extend",
    "admin.payments.confirmExtend": "Extend",

    // ===================== COMMON =====================
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.premium": "Premium",
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
    "common.close": "Close",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.all": "All",
    "common.none": "None",
    "common.yes": "Yes",
    "common.no": "No",
    "common.ok": "OK",
    "common.confirm": "Confirm",
    "common.retry": "Retry",
    "common.refresh": "Refresh",
    "common.saveChanges": "Save Changes",
  },
  ru: {
    // ===================== NAVIGATION & LAYOUT =====================
    "nav.dashboard": "Главная",
    "nav.courses": "Курсы",
    "nav.settings": "Настройки",
    "nav.logout": "Выйти",
    "nav.login": "Войти",
    "nav.roadmap": "Путь развития",
    "nav.analytics": "Аналитика",
    "nav.payments": "Оплата и Планы",
    "nav.myTasks": "Мои задачи",
    "nav.learningSpace": "Учебное пространство",
    "nav.taskWorkspace": "Рабочее пространство",
    "nav.courseDetails": "Детали курса",
    "nav.playground": "Песочница",
    "nav.platform": "Платформа",
    "nav.goPremium": "ПРЕМИУМ",
    "nav.pro": "Pro",
    "nav.freePlan": "Бесплатный план",
    "nav.version": "v2.4.0 • Practix",
    "nav.admin": "Метрики",
    "nav.leaderboard": "Таблица лидеров",

    // ===================== DASHBOARD =====================
    "dashboard.welcomeTitle": "Добро пожаловать в Practix",
    "dashboard.welcomeDesc":
      "Лучшая платформа для освоения программирования. Java, Go, System Design и алгоритмы — всё в одном месте.",
    "dashboard.browseCatalog": "Каталог курсов",
    "dashboard.pageTitle": "Главная",
    "dashboard.pageSubtitle": "Отслеживайте прогресс и поддерживайте темп.",
    "dashboard.currentStreak": "Текущая серия",
    "dashboard.totalSolved": "Всего решено",
    "dashboard.thisWeek": "за неделю",
    "dashboard.hoursSpent": "Часов потрачено",
    "dashboard.avgPerDay": "2.5ч в среднем/день",
    "dashboard.globalRank": "Глобальный рейтинг",
    "dashboard.topPercent": "Топ",
    "dashboard.skillPoints": "Очки навыков",
    "dashboard.maxStreak": "Макс. серия",
    "dashboard.submissions": "отправок",
    "dashboard.hours": "ч",
    "dashboard.minutes": "м",
    "dashboard.level": "Уровень 14",
    "dashboard.activityOverview": "Обзор активности",
    "dashboard.last7Days": "Последние 7 дней",
    "dashboard.last30Days": "Последние 30 дней",
    "dashboard.recentActivity": "Недавняя активность",
    "dashboard.pending": "В ожидании",
    "dashboard.completed": "Завершено",
    "dashboard.score": "Баллы",
    "dashboard.activeCourses": "Ваши активные курсы",
    "dashboard.percentCompleted": "% Завершено",
    "dashboard.days": "дней",
    "dashboard.loginRequired": "Войдите для просмотра панели",
    "dashboard.loginRequiredDesc":
      "Отслеживайте прогресс, смотрите статистику и продолжайте обучение",
    "dashboard.noActivity": "Нет недавней активности",
    "dashboard.startLearning": "Начать обучение →",

    // ===================== LEADERBOARD =====================
    "leaderboard.title": "Таблица лидеров",
    "leaderboard.subtitle": "Лучшие программисты по XP",
    "leaderboard.top50": "Топ 50 программистов",
    "leaderboard.empty": "Пока нет записей. Стань первым!",
    "leaderboard.loginRequired": "Присоединяйся к соревнованию",
    "leaderboard.loginRequiredDesc":
      "Войдите, чтобы увидеть свой рейтинг и соревноваться с другими.",
    "leaderboard.level": "Уровень",
    "leaderboard.xp": "XP",
    "leaderboard.tasks": "задач",
    "leaderboard.you": "Вы",
    "leaderboard.dayStreak": "дней подряд",
    "leaderboard.badgesEarned": "значков получено",
    "leaderboard.progressToLevel": "Прогресс до уровня",
    "leaderboard.streak": "Серия",

    // ===================== NOT FOUND =====================
    "notFound.title": "Страница не найдена",
    "notFound.description":
      "Страница, которую вы ищете, не существует или была перемещена.",
    "notFound.goHome": "На главную",
    "notFound.browseCourses": "Каталог курсов",

    // ===================== COURSES PAGE =====================
    "courses.title": "Каталог обучения",
    "courses.description":
      "Структурированные пути обучения, разработанные ведущими инженерами. Выберите языковой трек или погрузитесь в основы компьютерных наук.",
    "courses.allTracks": "Все треки",
    "courses.filterGo": "Go",
    "courses.filterJava": "Java",
    "courses.filterAlgoDS": "Алгоритмы и СД",
    "courses.filterMathDS": "Математика и DS",
    "courses.filterPatternsSE": "Паттерны и SE",
    "courses.filterMlAi": "AI / ML",
    "courses.filterDesignPatterns": "Паттерны проектирования",
    "courses.searchPlaceholder":
      "Поиск курсов по названию, теме или описанию...",
    "courses.groupLanguages": "Языки",
    "courses.groupCsFundamentals": "Основы CS",
    "courses.groupApplied": "Прикладное",
    "courses.languageTrack": "Языковой трек",
    "courses.csCore": "Основы CS",
    "courses.designPatterns": "Паттерны",
    "courses.softwareEng": "Software Eng",
    "courses.mlAi": "AI / ML",
    "courses.algoDs": "Алгоритмы",
    "courses.mathDs": "Математика и DS",
    "courses.topics": "Тем",
    "courses.duration": "Длительность",
    "courses.inProgress": "В процессе",
    "courses.notStarted": "Не начат",
    "courses.resume": "Продолжить",
    "courses.startLearning": "Начать обучение",
    "courses.loading": "Загрузка курсов...",
    "courses.comingSoon": "Скоро",
    "courses.comingSoonDesc":
      "Мы готовим новый премиум-контент для этой категории.",

    // ===================== COURSE DETAILS =====================
    "courseDetails.languageTrack": "Языковой трек",
    "courseDetails.csFundamental": "Основы CS",
    "courseDetails.modules": "Модулей",
    "courseDetails.trackProgress": "Прогресс трека",
    "courseDetails.continueJourney": "Продолжить путь",
    "courseDetails.coreCurriculum": "Базовая программа",
    "courseDetails.frameworksLibs": "Фреймворки и библиотеки",
    "courseDetails.interviewPrep": "Подготовка к собеседованию",
    "courseDetails.capstoneProjects": "Итоговые проекты",
    "courseDetails.curriculumModules": "Модули программы",
    "courseDetails.noContent": "Контент для этого раздела пока недоступен.",
    "courseDetails.topicsCount": "Тем",
    "courseDetails.done": "Готово",
    "courseDetails.loading": "Загрузка деталей курса...",
    "courseDetails.notFound": "Курс не найден.",
    "courseDetails.tasks": "Задач",

    // ===================== TASK WORKSPACE =====================
    "task.runCode": "ЗАПУСТИТЬ",
    "task.submit": "ОТПРАВИТЬ",
    "task.description": "Описание",
    "task.results": "Результаты",
    "task.noRunYet": "Запустите код для просмотра результатов",
    "task.latestRun": "Последний запуск",
    "task.loadCode": "Загрузить код",
    "task.solution": "Решение",
    "task.aiTutor": "AI Репетитор",
    "task.aiTutorPlaceholder": "Спросите AI...",
    "task.aiTutorEmpty":
      "Попросите подсказку, помощь с отладкой или анализ сложности.",
    "task.aiTutorLocked": "Разблокируйте Premium для чата с AI репетитором",
    "task.aiTutorLockedTitle": "AI Репетитор заблокирован",
    "task.hints": "Подсказки",
    "task.hint": "Подсказка",
    "task.relatedTopics": "Связанные темы",
    "task.solutionExplanation": "Объяснение решения",
    "task.solutionLocked": "Решение заблокировано",
    "task.solutionLockedDesc":
      "Перейдите на Premium для просмотра детального объяснения решения, разбора кода и примеров использования.",
    "task.unlockNow": "Разблокировать",
    "task.mobileTask": "Задача",
    "task.mobileEditor": "Редактор",
    "task.mobileTutor": "Репетитор",
    "task.loadingEnv": "Загрузка окружения...",
    "task.main": "main",
    "task.submissions": "Отправки",
    "task.submissionHistory": "История отправок",
    "task.noSubmissions": "Пока нет отправок.",
    "task.runtime": "Время выполнения",
    "task.executionOutput": "Результат выполнения",
    "task.loadingEditor": "Загрузка редактора...",
    "task.whyItMatters": "Почему это важно",
    "task.videoExplanation": "Видео объяснение",
    "task.videoDesc": "Пошаговый разбор решения",
    "task.poweredByYoutube": "На платформе YouTube",
    "task.openNewTab": "Открыть в новой вкладке ↗",
    "task.canonicalSolution": "Каноническое решение",
    "task.relatedConcepts": "Связанные концепции",
    "task.testsPassedToast": "🎉 Тесты пройдены! Отличная работа.",
    "task.score": "Баллы",
    "task.hint1": "Подсказка 1",
    "task.hint2": "Подсказка 2",
    "task.aiThinking": "Думаю...",
    "task.aiAskPlaceholder": "Спросить AI...",
    "task.aiUnlockToChat": "Разблокируйте Premium для чата",
    "task.prevTask": "Предыдущая задача (Alt+Left)",
    "task.nextTask": "Следующая задача (Alt+Right)",
    "task.testsPassed": "тестов пройдено",
    "task.allTestsPassed": "Все тесты пройдены!",
    "task.failedTests": "Провалившиеся тесты",
    "task.testInput": "Ввод",
    "task.expectedOutput": "Ожидалось",
    "task.actualOutput": "Получено",
    "task.error": "Ошибка",
    "task.runResults": "Результаты запуска",
    "task.running": "Выполнение...",
    "task.passed": "Пройден",
    "task.failed": "Провален",
    "task.executingCode": "Выполнение кода...",
    "task.errorDetails": "Детали ошибки",
    "task.output": "Вывод",
    "task.expected": "Ожидалось",
    "task.testResults": "Результаты тестов",
    "task.resetCode": "Сбросить код",
    "task.resetConfirm":
      "Сбросить код к начальному? Ваш текущий код будет потерян.",
    "task.reset": "Сбросить",
    "task.executionError": "Что-то пошло не так",
    "task.executionErrorHint":
      "Проверьте свой код и попробуйте снова. Если проблема сохраняется, попробуйте позже.",

    // ===================== BUG REPORT =====================
    "bugReport.title": "Сообщить о баге",
    "bugReport.generalFeedback": "Общий отзыв",
    "bugReport.selectCategory": "В какой области проблема?",
    "bugReport.categoryDescription": "Описание",
    "bugReport.categorySolution": "Решение",
    "bugReport.categoryEditor": "Редактор",
    "bugReport.categoryHints": "Подсказки",
    "bugReport.categoryAiTutor": "AI Тьютор",
    "bugReport.categoryOther": "Другое",
    "bugReport.severity": "Насколько серьёзна проблема?",
    "bugReport.severityLow": "Низкая",
    "bugReport.severityLowDesc": "Незначительное неудобство",
    "bugReport.severityMedium": "Средняя",
    "bugReport.severityMediumDesc": "Влияет на обучение",
    "bugReport.severityHigh": "Высокая",
    "bugReport.severityHighDesc": "Невозможно выполнить задание",
    "bugReport.issueTitle": "Краткое описание",
    "bugReport.issueTitlePlaceholder":
      "напр. Тесты не проходят с верным решением",
    "bugReport.description": "Опишите проблему",
    "bugReport.descriptionPlaceholder": "Что произошло? Что вы ожидали?",
    "bugReport.submit": "Отправить репорт",
    "bugReport.fillAllFields": "Заполните все обязательные поля",
    "bugReport.submitSuccess": "Отчёт об ошибке успешно отправлен!",
    "bugReport.submitError": "Не удалось отправить отчёт. Попробуйте снова.",

    // ===================== COMMON =====================
    "common.copy": "Копировать",
    "common.copied": "Скопировано!",

    // ===================== EDITOR =====================
    "editor.settings": "Настройки редактора",
    "editor.editorSettings": "Настройки редактора",
    "editor.minimapHint": "Показать миникарту кода справа",
    "editor.vimHint": "Vim клавиши (Продвинутое)",
    "editor.lineNumbersHint": "Показать номера строк",
    "editor.fontFamily": "Шрифт",
    "editor.autoSaveTitle": "Расслабься, ты в облаке! ☁️",
    "editor.autoSaveMessage":
      "Твой код сохраняется автоматически. Ctrl+S здесь не нужен!",
    "editor.gotIt": "Понял!",
    "editor.codeSaved": "Код сохранён",

    // ===================== TIMER =====================
    "timer.timeTools": "Таймер",
    "timer.stopwatch": "Секундомер",
    "timer.startStopwatch": "Запустить секундомер",
    "timer.timer": "Таймер",
    "timer.pause": "Пауза",
    "timer.resume": "Продолжить",
    "timer.reset": "Сброс",
    "timer.openTimer": "Открыть таймер/секундомер",
    "timer.customTimer": "Свой",
    "timer.min": "мин",
    "timer.sec": "сек",

    // ===================== DIFFICULTY =====================
    "difficulty.easy": "Легко",
    "difficulty.medium": "Средне",
    "difficulty.hard": "Сложно",

    // ===================== AUTH PAGE =====================
    "auth.welcomeBack": "С возвращением",
    "auth.createAccount": "Создать аккаунт",
    "auth.resetPassword": "Сбросить пароль",
    "auth.loginDesc":
      "Введите учётные данные для доступа к рабочему пространству.",
    "auth.registerDesc":
      "Присоединяйтесь к тысячам инженеров, совершенствующих свои навыки.",
    "auth.forgotDesc": "Введите email для получения ссылки на сброс.",
    "auth.fullName": "Полное имя",
    "auth.fullNamePlaceholder": "Алекс Разработчик",
    "auth.email": "Email адрес",
    "auth.emailPlaceholder": "alex@example.com",
    "auth.password": "Пароль",
    "auth.forgot": "Забыли?",
    "auth.signIn": "Войти",
    "auth.createAccountBtn": "Создать аккаунт",
    "auth.sendResetLink": "Отправить ссылку",
    "auth.orContinueWith": "Или продолжить с",
    "auth.github": "GitHub",
    "auth.noAccount": "Ещё нет аккаунта?",
    "auth.signUp": "Зарегистрироваться",
    "auth.haveAccount": "Уже есть аккаунт?",
    "auth.logIn": "Войти",
    "auth.backToSignIn": "← Назад к входу",
    "auth.resetLinkSent": "Ссылка для сброса пароля отправлена на email.",
    "auth.welcomeBackToast": "С возвращением",
    "auth.accountCreated": "Аккаунт успешно создан!",
    "auth.connectionFailed": "Ошибка соединения. Проверьте интернет.",
    "auth.loginRequired": "Требуется авторизация",
    "auth.loginRequiredDesc":
      "Войдите, чтобы получить доступ к этой функции и отслеживать прогресс.",
    "auth.signInToContinue": "Войти для продолжения",
    "auth.hasAccount": "Уже есть аккаунт?",

    // ===================== SETTINGS PAGE =====================
    "settings.title": "Настройки",
    "settings.description":
      "Управляйте профилем, настройками редактора и безопасностью.",
    "settings.publicProfile": "Публичный профиль",
    "settings.editorAppearance": "Редактор и внешний вид",
    "settings.notifications": "Уведомления",
    "settings.passwordSecurity": "Пароль и безопасность",
    "settings.uploadNew": "Загрузить новое",
    "settings.avatarHelper": "JPG, GIF или PNG. Макс. размер 800K.",
    "settings.fullName": "Полное имя",
    "settings.username": "Имя пользователя",
    "settings.bio": "О себе",
    "settings.bioPlaceholder": "Расскажите о себе...",
    "settings.editorConfig": "Конфигурация редактора",
    "settings.fontSize": "Размер шрифта",
    "settings.minimap": "Миникарта",
    "settings.minimapDesc": "Показывать миниатюрную карту кода справа.",
    "settings.vimBindings": "Vim клавиши",
    "settings.vimDesc":
      "Включить эмуляцию Vim для редактора кода (Продвинутое).",
    "settings.lineNumbers": "Номера строк",
    "settings.lineNumbersDesc": "Показывать номера строк слева.",
    "settings.emailPrefs": "Настройки email",
    "settings.weeklyDigest": "Еженедельный дайджест",
    "settings.weeklyDigestDesc":
      "Сводка прогресса и новых задач каждый понедельник.",
    "settings.newCourses": "Новые курсы и функции",
    "settings.newCoursesDesc": "Узнавайте первыми о запуске новых треков.",
    "settings.marketing": "Маркетинг и предложения",
    "settings.marketingDesc": "Акции и скидки на Premium планы.",
    "settings.securityAlerts": "Оповещения безопасности",
    "settings.securityAlertsDesc":
      "Важные уведомления о безопасности аккаунта.",
    "settings.security": "Безопасность",
    "settings.currentPassword": "Текущий пароль",
    "settings.newPassword": "Новый пароль",
    "settings.confirmPassword": "Подтвердите пароль",
    "settings.updatePassword": "Обновить пароль",
    "settings.twoFactor": "Двухфакторная аутентификация (2FA)",
    "settings.twoFactorDesc":
      "Добавьте дополнительный уровень защиты аккаунта.",
    "settings.enable2FA": "Включить 2FA",
    "settings.saveChanges": "Сохранить изменения",
    "settings.loginRequired": "Войдите для настроек",
    "settings.loginRequiredDesc":
      "Обновите профиль, смените пароль и управляйте уведомлениями.",
    "settings.savedSuccess": "Настройки успешно сохранены",
    "settings.savedFailed": "Не удалось сохранить настройки",
    "settings.chooseAvatar": "Выбрать аватар",
    "settings.presetAvatars": "Выберите готовый аватар",
    "settings.avatarHelperNew": "Макс. 200KB. PNG, JPG, GIF",
    "settings.avatarTooLarge": "Изображение слишком большое. Макс. 200KB.",
    "settings.avatarInvalidType": "Пожалуйста, выберите файл изображения.",
    "settings.avatarUpdated": "Аватар обновлён!",
    "settings.avatarUpdateFailed": "Не удалось обновить аватар.",

    // ===================== PREMIUM PAGE =====================
    "premium.tagline": "Раскройте свой потенциал",
    "premium.title": "Инвестируйте в карьеру",
    "premium.description":
      "Получите неограниченный доступ к AI-репетитору, мастер-классам по System Design и подготовке к собеседованиям уровня Senior.",
    "premium.starter": "Стартовый",
    "premium.starterPrice": "$0",
    "premium.foreverFree": "Навсегда бесплатно",
    "premium.starterFeature1": "Доступ к базовым трекам Java/Go",
    "premium.starterFeature2": "Ограниченные ежедневные запуски",
    "premium.starterFeature3": "Без AI Репетитора",
    "premium.starterFeature4": "Без курса System Design",
    "premium.currentPlan": "Текущий план",
    "premium.professional": "Профессиональный",
    "premium.proPrice": "$19",
    "premium.perMonth": "/мес",
    "premium.billedMonthly": "Ежемесячная оплата",
    "premium.mostPopular": "Самый популярный",
    "premium.proFeature1": "Всё из Стартового",
    "premium.proFeature2": "Practix AI Ассистент (Безлимит)",
    "premium.proFeature3": "System Design и архитектурные паттерны",
    "premium.proFeature4": "Верифицированные сертификаты",
    "premium.activeSubscription": "Активная подписка",
    "premium.upgradeToPro": "Перейти на Pro",
    "premium.subscriptionRequired": "Требуется подписка",
    "premium.subscriptionRequiredDesc":
      "Для этой задачи требуется активная подписка. Оформите подписку, чтобы получить доступ к премиум-контенту.",
    "premium.purchaseSubscription": "Смотреть планы",

    // ===================== MY TASKS PAGE =====================
    "myTasks.title": "Мои задачи",
    "myTasks.subtitle": "Продолжите с того места, где остановились.",
    "myTasks.noActiveCourses": "Нет активных курсов",
    "myTasks.noActiveCoursesDesc":
      "Вы ещё не начали ни одного курса. Посетите каталог, чтобы начать путь.",
    "myTasks.browseCourses": "Каталог курсов",
    "myTasks.loadingProgress": "Загрузка прогресса...",
    "myTasks.continueLearning": "Продолжить обучение",
    "myTasks.percentCompleted": "% Завершено",
    "myTasks.progress": "Прогресс",
    "myTasks.loginRequired": "Отслеживайте прогресс",
    "myTasks.loginRequiredDesc":
      "Войдите, чтобы отслеживать прогресс обучения и продолжить с того места, где остановились.",
    "myTasks.description": "Продолжите с того места, где остановились.",

    // ===================== ANALYTICS PAGE =====================
    "analytics.loginRequired": "Ваша аналитика",
    "analytics.loginRequiredDesc":
      "Войдите, чтобы увидеть показатели производительности, тепловые карты активности и рост навыков.",
    "analytics.title": "Аналитика",
    "analytics.subtitle":
      "Подробные метрики производительности и рост навыков.",
    "analytics.weeklyActivity": "Недельная активность",
    "analytics.yearlyContributions": "Активность за год",
    "analytics.noActivityThisWeek": "Нет активности на этой неделе",
    "analytics.youAreOnFire": "Вы в ударе!",
    "analytics.tasksSolvedThisWeek": "{count} задач решено на этой неделе.",
    "analytics.historicalData": "Данные за неделю {dateRange}.",
    "analytics.totalSubmissions": "Всего отправок",
    "analytics.maxStreak": "Макс. серия",
    "analytics.currentStreak": "Текущая серия",
    "analytics.less": "Меньше",
    "analytics.more": "Больше",
    "analytics.completionRate": "Процент решений",
    "analytics.avgRuntime": "Среднее время",
    "analytics.totalXP": "Всего XP",
    "analytics.loading": "Загрузка аналитики...",
    "analytics.noActivity": "Нет активности",
    "analytics.tasksCompleted": "{count} задач выполнено",
    // Day names for weekly chart
    "analytics.day.mon": "Пн",
    "analytics.day.tue": "Вт",
    "analytics.day.wed": "Ср",
    "analytics.day.thu": "Чт",
    "analytics.day.fri": "Пт",
    "analytics.day.sat": "Сб",
    "analytics.day.sun": "Вс",

    // ===================== ROADMAP PAGE =====================
    "roadmap.questionFocus": "Какой ваш основной фокус?",
    "roadmap.backendGo": "Backend (Go)",
    "roadmap.backendJava": "Backend (Java)",
    "roadmap.fullstack": "Fullstack",
    "roadmap.questionExperience": "Какой ваш опыт?",
    "roadmap.junior": "Junior (0-2 года)",
    "roadmap.midLevel": "Middle (3-5 лет)",
    "roadmap.senior": "Senior (5+ лет)",
    "roadmap.questionGoal": "Какова ваша главная цель?",
    "roadmap.landJob": "Найти новую работу",
    "roadmap.getPromoted": "Получить повышение",
    "roadmap.masterSkill": "Освоить конкретный навык",
    "roadmap.stepOf": "Шаг {step} из 3",
    "roadmap.title": "Ваш персональный путь",
    "roadmap.regenerate": "Перегенерировать",
    "roadmap.analyzingProfile": "Анализ профиля...",
    "roadmap.scanningMarket": "Сканирование требований рынка...",
    "roadmap.mappingDeps": "Построение зависимостей...",
    "roadmap.selectingResources": "Выбор лучших ресурсов...",
    "roadmap.finalizing": "Финализация пути...",
    "roadmap.loading": "Загрузка пути...",
    "roadmap.percentDone": "% Готово",
    "roadmap.goalAchieved": "Цель достигнута",
    "roadmap.readyForInterviews": "Готов к собеседованиям Senior уровня",
    "roadmap.introTitle": "Ваш путь обучения",
    "roadmap.introDescription":
      "Ответьте на несколько вопросов, и наш AI создаст персональный roadmap из 900+ задач, адаптированный под ваши цели.",
    "roadmap.featureAI": "AI-технологии",
    "roadmap.featureAIDesc": "Умный подбор задач на основе вашего профиля",
    "roadmap.featurePersonal": "Персонализация",
    "roadmap.featurePersonalDesc": "Адаптировано под ваш опыт и цели",
    "roadmap.featureProgress": "Отслеживание",
    "roadmap.featureProgressDesc": "Визуальный roadmap с прогрессом",
    "roadmap.interestsHint": "Выберите хотя бы одну область интересов",
    "roadmap.interestsError":
      "Пожалуйста, выберите хотя бы одну область интересов для продолжения",
    "roadmap.firstFree": "Первая генерация БЕСПЛАТНО",
    "roadmap.regeneratePremium": "Перегенерация с Premium",
    "roadmap.regeneratePremiumTitle": "Для перегенерации нужен Premium",
    "roadmap.regeneratePremiumDesc":
      "Обновитесь для создания неограниченного числа персонализированных роадмапов",
    "roadmap.yourPersonalRoadmap": "Ваш персональный Roadmap",
    "roadmap.startButton": "Создать мой Roadmap",
    "roadmap.questionFocusDesc": "Выберите основное направление обучения",
    "roadmap.questionHours": "Сколько времени вы можете уделять в неделю?",
    // NEW: Variant selection UI
    "roadmap.chooseYourPath": "Выберите свой путь",
    "roadmap.variantsGenerated":
      "Мы создали {count} персонализированных роадмапов на основе ваших целей",
    "roadmap.adjustPreferences": "Изменить параметры",
    "roadmap.startPath": "Начать {name}",
    "roadmap.recommended": "Рекомендуется",
    "roadmap.tasks": "Задачи",
    "roadmap.expectedSalary": "Ожидаемая зарплата",
    "roadmap.topics": "Темы",
    "roadmap.fromCourses": "Из курсов",
    "roadmap.firstTasks": "Первые задачи",
    "roadmap.clickToSelect": "Нажмите для выбора",
    "roadmap.selected": "Выбрано",
    "roadmap.generateRoadmaps": "Создать Roadmaps",
    "roadmap.wizardStep1Title": "Ваш опыт",
    "roadmap.wizardStep1Subtitle": "Выберите языки, которые вы знаете",
    "roadmap.wizardStep2Title": "Уровень опыта",
    "roadmap.wizardStep2Subtitle": "Как давно вы программируете?",
    "roadmap.wizardStep3Title": "Ваши интересы",
    "roadmap.wizardStep3Subtitle": "Что вы хотите изучить?",
    "roadmap.wizardStep4Title": "Ваша цель",
    "roadmap.wizardStep4Subtitle": "Чего вы хотите достичь?",
    "roadmap.wizardStep5Title": "Время на обучение",
    "roadmap.wizardStep5Subtitle": "Сколько времени вы можете уделять?",

    // ===================== PAYMENTS PAGE =====================
    "payments.title": "Биллинг и платежи",
    "payments.description":
      "Управляйте подпиской и просматривайте историю платежей.",
    "payments.currentPlan": "Текущий план",
    "payments.professional": "Профессиональный",
    "payments.activeDesc":
      "Ваша подписка продлится {date}. У вас полный доступ ко всем функциям.",
    "payments.freeStarter": "Бесплатный Стартовый",
    "payments.freeDesc":
      "Вы на бесплатном плане. Обновитесь, чтобы раскрыть весь потенциал Practix.",
    "payments.manageSubscription": "Управление подпиской",
    "payments.upgradePlan": "Обновить план",
    "payments.paymentMethods": "Способы оплаты",
    "payments.visa": "VISA",
    "payments.cardEnding": "Visa заканчивается на {last4}",
    "payments.expires": "Истекает {date}",
    "payments.edit": "Изменить",
    "payments.addPaymentMethod": "Добавить способ оплаты",
    "payments.paymentHistory": "История платежей",
    "payments.invoiceId": "ID счёта",
    "payments.date": "Дата",
    "payments.descriptionCol": "Описание",
    "payments.amount": "Сумма",
    "payments.status": "Статус",
    "payments.loadingHistory": "Загрузка истории...",
    "payments.download": "Скачать",

    // ===================== ADMIN DASHBOARD =====================
    "admin.title": "Метрики",
    "admin.subtitle": "Статистика платформы.",
    "admin.totalUsers": "Всего пользователей",
    "admin.newUsers": "Новые (30 дней)",
    "admin.activeUsers": "Активные (месяц)",
    "admin.totalSubmissions": "Всего решений",
    "admin.activeSubscriptions": "Активные подписки",
    "admin.thisMonth": "в этом месяце",
    "admin.subscriptionsByPlan": "Подписки по плану",
    "admin.globalAccess": "Полный доступ",
    "admin.courseAccess": "Доступ к курсу",
    "admin.subscribers": "подписчиков",
    "admin.showMore": "Показать ещё",
    "admin.showLess": "Свернуть",
    "admin.noActiveSubscriptions": "Нет активных подписок",
    "admin.monthlyRevenue": "Месячный доход",
    "admin.estimatedMonthly": "Ориентировочно в месяц",
    "admin.submissionsByStatus": "Решения по статусу",
    "admin.noSubmissions": "Пока нет решений",
    "admin.submissionsByDay": "Решения по дням (30 дней)",
    "admin.coursePopularity": "Популярность курсов",
    "admin.noEnrollmentData": "Нет данных о записях",
    "admin.topCoursesByCompletion": "Топ курсов по завершению",
    "admin.course": "Курс",
    "admin.completions": "Завершений",
    "admin.rate": "Процент",
    "admin.hardestTasks": "Сложные задачи",
    "admin.task": "Задача",
    "admin.submissions": "Решений",
    "admin.passRate": "Успешность",
    "admin.loginRequired": "Требуется вход",
    "admin.loginRequiredDesc": "Войдите для доступа к админ панели.",
    "admin.loading": "Загрузка панели...",
    "admin.statusPassed": "Принято",
    "admin.statusFailed": "Отклонено",
    "admin.statusError": "Ошибка",
    "admin.statusTimeout": "Таймаут",
    "admin.statusCompileError": "Ошибка компиляции",
    "admin.statusPending": "Ожидание",
    "admin.enrolled": "записано",
    "admin.completed": "завершено",

    // AI Settings
    "admin.aiSettings.title": "Настройки AI Tutor",
    "admin.aiSettings.subtitle": "Настройте дневные лимиты запросов к AI Tutor",
    "admin.aiSettings.enabled": "AI Tutor включён",
    "admin.aiSettings.disabled": "AI Tutor отключён",
    "admin.aiSettings.dailyLimits": "Дневные лимиты запросов",
    "admin.aiSettings.freeTier": "Бесплатный план",
    "admin.aiSettings.freeTierDesc": "Пользователи без подписки",
    "admin.aiSettings.courseTier": "План курса",
    "admin.aiSettings.courseTierDesc": "Пользователи с подпиской на один курс",
    "admin.aiSettings.premiumTier": "Премиум план",
    "admin.aiSettings.premiumTierDesc":
      "Пользователи с глобальным премиум доступом",
    "admin.aiSettings.promptEngineeringTier": "Prompt Engineering",
    "admin.aiSettings.promptEngineeringTierDesc":
      "Специальный лимит для курса PE",
    "admin.aiSettings.saveChanges": "Сохранить изменения",
    "admin.aiSettings.saving": "Сохранение...",
    "admin.aiSettings.saveSuccess": "Настройки успешно сохранены!",
    "admin.aiSettings.loadError": "Ошибка загрузки настроек AI",
    "admin.aiSettings.saveError": "Ошибка сохранения настроек AI",

    // Bug Reports
    "admin.bugReports.title": "Баг-репорты",
    "admin.bugReports.subtitle": "Отчёты пользователей об ошибках",
    "admin.bugReports.allStatuses": "Все статусы",
    "admin.bugReports.noReports": "Баг-репорты не найдены",
    "admin.bugReports.loadError": "Ошибка загрузки баг-репортов",
    "admin.bugReports.description": "Описание",
    "admin.bugReports.relatedTask": "Связанная задача",
    "admin.bugReports.metadata": "Метаданные",
    "admin.bugReports.status.open": "Открыт",
    "admin.bugReports.status.in-progress": "В работе",
    "admin.bugReports.status.resolved": "Решён",
    "admin.bugReports.status.closed": "Закрыт",
    "admin.bugReports.status.wont-fix": "Не будет исправлен",

    // User Search
    "admin.userSearch.title": "Поиск пользователей",
    "admin.userSearch.subtitle": "Поиск по email или имени",
    "admin.userSearch.placeholder": "Введите email или имя...",
    "admin.userSearch.search": "Найти",
    "admin.userSearch.minChars": "Введите минимум 2 символа",
    "admin.userSearch.searchError": "Ошибка поиска пользователей",
    "admin.userSearch.noResults": "Пользователи не найдены",
    "admin.userSearch.noName": "Без имени",
    "admin.userSearch.registered": "Регистрация",
    "admin.userSearch.lastActive": "Последняя активность",
    "admin.userSearch.submissions": "отправок",
    "admin.userSearch.courses": "курсов",
    "admin.userSearch.hint": "Поиск пользователей по email или имени",
    "admin.userSearch.banned": "Заблокирован",
    "admin.userSearch.ban": "Бан",
    "admin.userSearch.unban": "Разбан",
    "admin.userSearch.banReason": "Причина бана",
    "admin.userSearch.banError": "Не удалось заблокировать пользователя",
    "admin.userSearch.unbanError": "Не удалось разблокировать пользователя",
    "admin.userSearch.banModalTitle": "Заблокировать пользователя",
    "admin.userSearch.banModalDesc":
      "Вы собираетесь заблокировать пользователя",
    "admin.userSearch.banReasonLabel": "Причина блокировки",
    "admin.userSearch.banReasonPlaceholder": "Введите причину блокировки...",
    "admin.userSearch.confirmBan": "Заблокировать",

    // ===================== ADMIN PAYMENTS =====================
    "admin.payments.title": "Управление платежами",
    "admin.payments.subtitle": "Платежи, подписки и доходы",
    "admin.payments.tab.revenue": "Доходы",
    "admin.payments.tab.subscriptions": "Подписки",
    "admin.payments.tab.payments": "Платежи",
    "admin.payments.loadError": "Ошибка загрузки данных",
    "admin.payments.thisMonth": "Этот месяц",
    "admin.payments.lastMonth": "Прошлый месяц",
    "admin.payments.totalRevenue": "Всего доходов",
    "admin.payments.refunded": "Возвращено",
    "admin.payments.transactions": "транзакций",
    "admin.payments.byProvider": "По провайдеру",
    "admin.payments.noData": "Нет данных",
    "admin.payments.oneTimePurchases": "Разовые покупки",
    "admin.payments.purchases": "покупок",
    "admin.payments.allStatuses": "Все статусы",
    "admin.payments.allProviders": "Все провайдеры",
    "admin.payments.total": "Всего",
    "admin.payments.refund": "Возврат",
    "admin.payments.noPayments": "Платежи не найдены",
    "admin.payments.expires": "Истекает",
    "admin.payments.payments": "платежей",
    "admin.payments.extend": "Продлить",
    "admin.payments.cancelSub": "Отменить",
    "admin.payments.noSubscriptions": "Подписки не найдены",
    "admin.payments.confirmCancel":
      "Вы уверены, что хотите отменить подписку для",
    "admin.payments.refundError": "Ошибка возврата платежа",
    "admin.payments.extendError": "Ошибка продления подписки",
    "admin.payments.cancelError": "Ошибка отмены подписки",
    "admin.payments.refundModalTitle": "Возврат платежа",
    "admin.payments.refundModalDesc": "Вы собираетесь вернуть",
    "admin.payments.for": "для",
    "admin.payments.refundReasonLabel": "Причина возврата",
    "admin.payments.refundReasonPlaceholder": "Введите причину возврата...",
    "admin.payments.confirmRefund": "Вернуть платеж",
    "admin.payments.extendModalTitle": "Продление подписки",
    "admin.payments.extendModalDesc": "Продлить подписку для",
    "admin.payments.extendDaysLabel": "Дней продления",
    "admin.payments.confirmExtend": "Продлить",

    // ===================== COMMON =====================
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.premium": "Премиум",
    "common.back": "Назад",
    "common.next": "Далее",
    "common.submit": "Отправить",
    "common.close": "Закрыть",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.view": "Просмотр",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.sort": "Сортировка",
    "common.all": "Все",
    "common.none": "Нет",
    "common.yes": "Да",
    "common.no": "Нет",
    "common.ok": "ОК",
    "common.confirm": "Подтвердить",
    "common.retry": "Повторить",
    "common.refresh": "Обновить",
    "common.saveChanges": "Сохранить изменения",
  },
  uz: {
    // ===================== NAVIGATION & LAYOUT =====================
    "nav.dashboard": "Bosh sahifa",
    "nav.courses": "Kurslar",
    "nav.settings": "Sozlamalar",
    "nav.logout": "Chiqish",
    "nav.login": "Kirish",
    "nav.roadmap": "Rivojlanish yo'li",
    "nav.analytics": "Analitika",
    "nav.payments": "To'lovlar va Rejalar",
    "nav.myTasks": "Mening vazifalarim",
    "nav.learningSpace": "O'quv maydoni",
    "nav.taskWorkspace": "Ish maydoni",
    "nav.courseDetails": "Kurs tafsilotlari",
    "nav.playground": "Sinov maydoni",
    "nav.platform": "Platforma",
    "nav.goPremium": "PREMIUM",
    "nav.pro": "Pro",
    "nav.freePlan": "Bepul reja",
    "nav.version": "v2.4.0 • Practix",
    "nav.admin": "Metrika",
    "nav.leaderboard": "Liderlar jadvali",

    // ===================== DASHBOARD =====================
    "dashboard.welcomeTitle": "Practixga xush kelibsiz",
    "dashboard.welcomeDesc":
      "Dasturlashni o'rganish uchun eng yaxshi platforma. Java, Go, System Design va algoritmlar — hammasi bir joyda.",
    "dashboard.browseCatalog": "Katalogni ko'rish",
    "dashboard.pageTitle": "Bosh sahifa",
    "dashboard.pageSubtitle":
      "O'z yutuqlaringizni kuzating va sur'atni saqlang.",
    "dashboard.currentStreak": "Joriy seriya",
    "dashboard.totalSolved": "Jami yechilgan",
    "dashboard.thisWeek": "bu hafta",
    "dashboard.hoursSpent": "Sarflangan soatlar",
    "dashboard.avgPerDay": "O'rtacha 2.5s/kun",
    "dashboard.globalRank": "Global reyting",
    "dashboard.topPercent": "Top",
    "dashboard.skillPoints": "Mahorat ballari",
    "dashboard.maxStreak": "Maks. seriya",
    "dashboard.submissions": "yuborishlar",
    "dashboard.hours": "s",
    "dashboard.minutes": "d",
    "dashboard.level": "Daraja 14",
    "dashboard.activityOverview": "Faollik sharhi",
    "dashboard.last7Days": "Oxirgi 7 kun",
    "dashboard.last30Days": "Oxirgi 30 kun",
    "dashboard.recentActivity": "So'nggi faollik",
    "dashboard.pending": "Kutilmoqda",
    "dashboard.completed": "Bajarilgan",
    "dashboard.score": "Ball",
    "dashboard.activeCourses": "Faol kurslaringiz",
    "dashboard.percentCompleted": "% Bajarildi",
    "dashboard.days": "kun",
    "dashboard.loginRequired":
      "Boshqaruv panelini ko'rish uchun tizimga kiring",
    "dashboard.loginRequiredDesc":
      "Jarayonni kuzating, statistikani ko'ring va o'rganishni davom ettiring",
    "dashboard.noActivity": "So'nggi faollik yo'q",
    "dashboard.startLearning": "O'rganishni boshlash →",

    // ===================== LEADERBOARD =====================
    "leaderboard.title": "Liderlar jadvali",
    "leaderboard.subtitle": "XP bo'yicha eng yaxshi dasturchilar",
    "leaderboard.top50": "Eng yaxshi 50 dasturchi",
    "leaderboard.empty": "Hali yozuvlar yo'q. Birinchi bo'ling!",
    "leaderboard.loginRequired": "Musobaqaga qo'shiling",
    "leaderboard.loginRequiredDesc":
      "Reyting va boshqa dasturchilar bilan raqobatlashish uchun tizimga kiring.",
    "leaderboard.level": "Daraja",
    "leaderboard.xp": "XP",
    "leaderboard.tasks": "vazifalar",
    "leaderboard.you": "Siz",
    "leaderboard.dayStreak": "kun ketma-ket",
    "leaderboard.badgesEarned": "nishon olindi",
    "leaderboard.progressToLevel": "Darajaga progress",
    "leaderboard.streak": "Seriya",

    // ===================== NOT FOUND =====================
    "notFound.title": "Sahifa topilmadi",
    "notFound.description":
      "Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.",
    "notFound.goHome": "Bosh sahifaga",
    "notFound.browseCourses": "Kurslarni ko'rish",

    // ===================== COURSES PAGE =====================
    "courses.title": "O'quv katalogi",
    "courses.description":
      "Yetakchi muhandislar tomonidan ishlab chiqilgan tizimli o'quv yo'llari. Til trekini tanlang yoki kompyuter fanlari asoslariga sho'ng'ing.",
    "courses.allTracks": "Barcha treklar",
    "courses.filterGo": "Go",
    "courses.filterJava": "Java",
    "courses.filterAlgoDS": "Algoritmlar va MT",
    "courses.filterMathDS": "Matematika va DS",
    "courses.filterPatternsSE": "Patternlar va SE",
    "courses.filterMlAi": "AI / ML",
    "courses.filterDesignPatterns": "Dizayn patternlar",
    "courses.searchPlaceholder":
      "Kurslarni nom, mavzu yoki tavsif bo'yicha qidirish...",
    "courses.groupLanguages": "Tillar",
    "courses.groupCsFundamentals": "CS Asoslari",
    "courses.groupApplied": "Amaliy",
    "courses.languageTrack": "Til treki",
    "courses.csCore": "CS asoslari",
    "courses.designPatterns": "Patternlar",
    "courses.softwareEng": "Software Eng",
    "courses.mlAi": "AI / ML",
    "courses.algoDs": "Algoritmlar",
    "courses.mathDs": "Matematika va DS",
    "courses.topics": "Mavzular",
    "courses.duration": "Davomiylik",
    "courses.inProgress": "Jarayonda",
    "courses.notStarted": "Boshlanmagan",
    "courses.resume": "Davom ettirish",
    "courses.startLearning": "O'rganishni boshlash",
    "courses.loading": "Kurslar yuklanmoqda...",
    "courses.comingSoon": "Tez orada",
    "courses.comingSoonDesc":
      "Biz ushbu toifa uchun yangi premium kontent tayyorlaymiz.",

    // ===================== COURSE DETAILS =====================
    "courseDetails.languageTrack": "Til treki",
    "courseDetails.csFundamental": "CS asoslari",
    "courseDetails.modules": "Modullar",
    "courseDetails.trackProgress": "Trek jarayoni",
    "courseDetails.continueJourney": "Yo'lni davom ettirish",
    "courseDetails.coreCurriculum": "Asosiy dastur",
    "courseDetails.frameworksLibs": "Freymworklar va kutubxonalar",
    "courseDetails.interviewPrep": "Suhbatga tayyorgarlik",
    "courseDetails.capstoneProjects": "Yakuniy loyihalar",
    "courseDetails.curriculumModules": "Dastur modullari",
    "courseDetails.noContent": "Bu bo'lim uchun kontent hali mavjud emas.",
    "courseDetails.topicsCount": "Mavzular",
    "courseDetails.done": "Tayyor",
    "courseDetails.loading": "Kurs tafsilotlari yuklanmoqda...",
    "courseDetails.notFound": "Kurs topilmadi.",
    "courseDetails.tasks": "Vazifalar",

    // ===================== TASK WORKSPACE =====================
    "task.runCode": "ISHGA TUSHIRISH",
    "task.submit": "YUBORISH",
    "task.description": "Tavsif",
    "task.results": "Natijalar",
    "task.noRunYet": "Natijalarni ko'rish uchun kodingizni ishga tushiring",
    "task.latestRun": "Oxirgi ishga tushirish",
    "task.loadCode": "Kodni yuklash",
    "task.solution": "Yechim",
    "task.aiTutor": "AI Repetitor",
    "task.aiTutorPlaceholder": "AI dan so'rang...",
    "task.aiTutorEmpty":
      "Maslahat, debugging yordami yoki murakkablik tahlilini so'rang.",
    "task.aiTutorLocked":
      "AI repetitor bilan suhbatlashish uchun Premium oching",
    "task.aiTutorLockedTitle": "AI Repetitor qulflangan",
    "task.hints": "Maslahatlar",
    "task.hint": "Maslahat",
    "task.relatedTopics": "Tegishli mavzular",
    "task.solutionExplanation": "Yechim tushuntirishi",
    "task.solutionLocked": "Yechim qulflangan",
    "task.solutionLockedDesc":
      "Batafsil yechim tushuntirishi, kod tahlili va amaliy misollarni ko'rish uchun Premium ga o'ting.",
    "task.unlockNow": "Ochish",
    "task.mobileTask": "Vazifa",
    "task.mobileEditor": "Muharrir",
    "task.mobileTutor": "Repetitor",
    "task.loadingEnv": "Muhit yuklanmoqda...",
    "task.main": "main",
    "task.submissions": "Yuborishlar",
    "task.submissionHistory": "Yuborish tarixi",
    "task.noSubmissions": "Hali yuborishlar yo'q.",
    "task.runtime": "Ishlash vaqti",
    "task.executionOutput": "Bajarilish natijasi",
    "task.loadingEditor": "Muharrir yuklanmoqda...",
    "task.whyItMatters": "Nima uchun bu muhim",
    "task.videoExplanation": "Video tushuntirish",
    "task.videoDesc": "Bosqichma-bosqich yechim tahlili",
    "task.poweredByYoutube": "YouTube platformasida",
    "task.openNewTab": "Yangi oynada ochish ↗",
    "task.canonicalSolution": "Kanonik yechim",
    "task.relatedConcepts": "Tegishli tushunchalar",
    "task.testsPassedToast": "🎉 Testlar o'tdi! Ajoyib ish.",
    "task.score": "Ball",
    "task.hint1": "Maslahat 1",
    "task.hint2": "Maslahat 2",
    "task.aiThinking": "O'ylayapman...",
    "task.aiAskPlaceholder": "AI dan so'rang...",
    "task.aiUnlockToChat": "Suhbatlashish uchun Premium oching",
    "task.prevTask": "Oldingi vazifa (Alt+Left)",
    "task.nextTask": "Keyingi vazifa (Alt+Right)",
    "task.testsPassed": "test o'tdi",
    "task.allTestsPassed": "Barcha testlar o'tdi!",
    "task.failedTests": "Muvaffaqiyatsiz testlar",
    "task.testInput": "Kirish",
    "task.expectedOutput": "Kutilgan",
    "task.actualOutput": "Haqiqiy",
    "task.error": "Xatolik",
    "task.runResults": "Ishga tushirish natijalari",
    "task.running": "Bajarilmoqda...",
    "task.passed": "O'tdi",
    "task.failed": "Muvaffaqiyatsiz",
    "task.executingCode": "Kod bajarilmoqda...",
    "task.errorDetails": "Xatolik tafsilotlari",
    "task.output": "Chiqish",
    "task.expected": "Kutilgan",
    "task.testResults": "Test natijalari",
    "task.resetCode": "Kodni qayta tiklash",
    "task.resetConfirm":
      "Kodni boshlang'ichga qaytarasizmi? Joriy kodingiz yo'qoladi.",
    "task.reset": "Qaytarish",
    "task.executionError": "Xatolik yuz berdi",
    "task.executionErrorHint":
      "Kodingizni tekshiring va qaytadan urinib ko'ring. Muammo davom etsa, keyinroq urinib ko'ring.",

    // ===================== BUG REPORT =====================
    "bugReport.title": "Xatolik haqida xabar berish",
    "bugReport.generalFeedback": "Umumiy fikr-mulohaza",
    "bugReport.selectCategory": "Qaysi sohada muammo bor?",
    "bugReport.categoryDescription": "Tavsif",
    "bugReport.categorySolution": "Yechim",
    "bugReport.categoryEditor": "Muharrir",
    "bugReport.categoryHints": "Maslahatlar",
    "bugReport.categoryAiTutor": "AI Repetitor",
    "bugReport.categoryOther": "Boshqa",
    "bugReport.severity": "Muammo qanchalik jiddiy?",
    "bugReport.severityLow": "Past",
    "bugReport.severityLowDesc": "Kichik noqulaylik",
    "bugReport.severityMedium": "O'rtacha",
    "bugReport.severityMediumDesc": "O'rganishga ta'sir qiladi",
    "bugReport.severityHigh": "Yuqori",
    "bugReport.severityHighDesc": "Vazifani bajara olmayapman",
    "bugReport.issueTitle": "Qisqa tavsif",
    "bugReport.issueTitlePlaceholder":
      "mas. To'g'ri javob bilan testlar o'tmayapti",
    "bugReport.description": "Muammoni tasvirlab bering",
    "bugReport.descriptionPlaceholder": "Nima sodir bo'ldi? Nimani kutgansiz?",
    "bugReport.submit": "Hisobot yuborish",
    "bugReport.fillAllFields": "Barcha maydonlarni to'ldiring",
    "bugReport.submitSuccess": "Xatolik hisoboti muvaffaqiyatli yuborildi!",
    "bugReport.submitError":
      "Hisobotni yuborib bo'lmadi. Qayta urinib ko'ring.",

    // ===================== COMMON =====================
    "common.copy": "Nusxa olish",
    "common.copied": "Nusxa olindi!",

    // ===================== EDITOR =====================
    "editor.settings": "Muharrir sozlamalari",
    "editor.editorSettings": "Muharrir sozlamalari",
    "editor.minimapHint": "O'ng tomonda kod minikartasini ko'rsatish",
    "editor.vimHint": "Vim tugmalari (Murakkab)",
    "editor.lineNumbersHint": "Qator raqamlarini ko'rsatish",
    "editor.fontFamily": "Shrift",
    "editor.autoSaveTitle": "Tinchlan, siz bulutdasiz! ☁️",
    "editor.autoSaveMessage":
      "Kodingiz avtomatik saqlanadi. Bu yerda Ctrl+S kerak emas!",
    "editor.gotIt": "Tushundim!",
    "editor.codeSaved": "Kod saqlandi",

    // ===================== TIMER =====================
    "timer.timeTools": "Vaqt vositalari",
    "timer.stopwatch": "Sekundomer",
    "timer.startStopwatch": "Sekundomerni ishga tushirish",
    "timer.timer": "Taymer",
    "timer.pause": "Pauza",
    "timer.resume": "Davom",
    "timer.reset": "Qayta",
    "timer.openTimer": "Taymer/Sekundomerni ochish",
    "timer.customTimer": "Maxsus",
    "timer.min": "daq",
    "timer.sec": "son",

    // ===================== DIFFICULTY =====================
    "difficulty.easy": "Oson",
    "difficulty.medium": "O'rtacha",
    "difficulty.hard": "Qiyin",

    // ===================== AUTH PAGE =====================
    "auth.welcomeBack": "Qaytganingiz bilan",
    "auth.createAccount": "Hisob yaratish",
    "auth.resetPassword": "Parolni tiklash",
    "auth.loginDesc": "Ish maydoniga kirish uchun ma'lumotlaringizni kiriting.",
    "auth.registerDesc":
      "O'z mahoratini oshirayotgan minglab muhandislarga qo'shiling.",
    "auth.forgotDesc": "Tiklash havolasini olish uchun emailingizni kiriting.",
    "auth.fullName": "To'liq ism",
    "auth.fullNamePlaceholder": "Aleks Dasturchi",
    "auth.email": "Email manzil",
    "auth.emailPlaceholder": "alex@example.com",
    "auth.password": "Parol",
    "auth.forgot": "Unutdingizmi?",
    "auth.signIn": "Kirish",
    "auth.createAccountBtn": "Hisob yaratish",
    "auth.sendResetLink": "Havola yuborish",
    "auth.orContinueWith": "Yoki davom eting",
    "auth.github": "GitHub",
    "auth.noAccount": "Hisobingiz yo'qmi?",
    "auth.signUp": "Ro'yxatdan o'tish",
    "auth.haveAccount": "Hisobingiz bormi?",
    "auth.logIn": "Kirish",
    "auth.backToSignIn": "← Kirishga qaytish",
    "auth.resetLinkSent": "Parolni tiklash havolasi emailga yuborildi.",
    "auth.welcomeBackToast": "Qaytganingiz bilan",
    "auth.accountCreated": "Hisob muvaffaqiyatli yaratildi!",
    "auth.connectionFailed": "Ulanish xatosi. Internetni tekshiring.",
    "auth.loginRequired": "Kirish talab qilinadi",
    "auth.loginRequiredDesc":
      "Bu funksiyaga kirish va jarayonni kuzatish uchun tizimga kiring.",
    "auth.signInToContinue": "Davom etish uchun kiring",
    "auth.hasAccount": "Hisobingiz bormi?",

    // ===================== SETTINGS PAGE =====================
    "settings.title": "Sozlamalar",
    "settings.description":
      "Profil, muharrir sozlamalari va xavfsizlikni boshqaring.",
    "settings.publicProfile": "Ommaviy profil",
    "settings.editorAppearance": "Muharrir va ko'rinish",
    "settings.notifications": "Bildirishnomalar",
    "settings.passwordSecurity": "Parol va xavfsizlik",
    "settings.uploadNew": "Yangi yuklash",
    "settings.avatarHelper": "JPG, GIF yoki PNG. Maks. hajm 800K.",
    "settings.fullName": "To'liq ism",
    "settings.username": "Foydalanuvchi nomi",
    "settings.bio": "Bio",
    "settings.bioPlaceholder": "O'zingiz haqingizda ayting...",
    "settings.editorConfig": "Muharrir konfiguratsiyasi",
    "settings.fontSize": "Shrift o'lchami",
    "settings.minimap": "Minikarta",
    "settings.minimapDesc": "O'ng tomonda kod minikartasini ko'rsatish.",
    "settings.vimBindings": "Vim tugmalari",
    "settings.vimDesc":
      "Kod muharriri uchun Vim emulyatsiyasini yoqish (Murakkab).",
    "settings.lineNumbers": "Qator raqamlari",
    "settings.lineNumbersDesc": "Chap tomonda qator raqamlarini ko'rsatish.",
    "settings.emailPrefs": "Email sozlamalari",
    "settings.weeklyDigest": "Haftalik xulosa",
    "settings.weeklyDigestDesc":
      "Har dushanba yutuqlar va yangi vazifalar xulosasi.",
    "settings.newCourses": "Yangi kurslar va funksiyalar",
    "settings.newCoursesDesc":
      "Yangi treklar chiqishi haqida birinchi bo'lib bilib oling.",
    "settings.marketing": "Marketing va takliflar",
    "settings.marketingDesc": "Premium rejalar uchun aksiyalar va chegirmalar.",
    "settings.securityAlerts": "Xavfsizlik ogohlantirishlari",
    "settings.securityAlertsDesc":
      "Hisob xavfsizligi haqida muhim bildirishnomalar.",
    "settings.security": "Xavfsizlik",
    "settings.currentPassword": "Joriy parol",
    "settings.newPassword": "Yangi parol",
    "settings.confirmPassword": "Parolni tasdiqlang",
    "settings.updatePassword": "Parolni yangilash",
    "settings.twoFactor": "Ikki faktorli autentifikatsiya (2FA)",
    "settings.twoFactorDesc":
      "Hisobingizga qo'shimcha himoya qatlamini qo'shing.",
    "settings.enable2FA": "2FA ni yoqish",
    "settings.saveChanges": "O'zgarishlarni saqlash",
    "settings.loginRequired": "Sozlamalar uchun kiring",
    "settings.loginRequiredDesc":
      "Profilni yangilang, parolni o'zgartiring va bildirishnomalarni boshqaring.",
    "settings.savedSuccess": "Sozlamalar muvaffaqiyatli saqlandi",
    "settings.savedFailed": "Sozlamalarni saqlash muvaffaqiyatsiz",
    "settings.chooseAvatar": "Avatar tanlash",
    "settings.presetAvatars": "Tayyor avatarni tanlang",
    "settings.avatarHelperNew": "Maks. 200KB. PNG, JPG, GIF",
    "settings.avatarTooLarge": "Rasm juda katta. Maks. 200KB.",
    "settings.avatarInvalidType": "Iltimos, rasm faylini tanlang.",
    "settings.avatarUpdated": "Avatar yangilandi!",
    "settings.avatarUpdateFailed": "Avatarni yangilab bo'lmadi.",

    // ===================== PREMIUM PAGE =====================
    "premium.tagline": "Potentsialingizni oching",
    "premium.title": "Karyerangizga sarmoya qiling",
    "premium.description":
      "AI-repetitor, System Design master-klasslari va Senior darajadagi suhbatga tayyorgarlikka cheksiz kirish oling.",
    "premium.starter": "Boshlang'ich",
    "premium.starterPrice": "$0",
    "premium.foreverFree": "Doimo bepul",
    "premium.starterFeature1": "Asosiy Java/Go treklarga kirish",
    "premium.starterFeature2": "Cheklangan kunlik ishga tushirishlar",
    "premium.starterFeature3": "AI Repetitor yo'q",
    "premium.starterFeature4": "System Design kursi yo'q",
    "premium.currentPlan": "Joriy reja",
    "premium.professional": "Professional",
    "premium.proPrice": "$19",
    "premium.perMonth": "/oy",
    "premium.billedMonthly": "Oylik to'lov",
    "premium.mostPopular": "Eng mashhur",
    "premium.proFeature1": "Boshlang'ichdagi hamma narsa",
    "premium.proFeature2": "Practix AI Yordamchi (Cheksiz)",
    "premium.proFeature3": "System Design va arxitektura patternlari",
    "premium.proFeature4": "Tasdiqlangan sertifikatlar",
    "premium.activeSubscription": "Faol obuna",
    "premium.upgradeToPro": "Pro ga o'tish",
    "premium.subscriptionRequired": "Obuna talab qilinadi",
    "premium.subscriptionRequiredDesc":
      "Bu vazifa faol obunani talab qiladi. Premium kontentga kirish uchun obuna sotib oling.",
    "premium.purchaseSubscription": "Rejalarni ko'rish",

    // ===================== MY TASKS PAGE =====================
    "myTasks.title": "Mening vazifalarim",
    "myTasks.subtitle": "To'xtatgan joyingizdan davom eting.",
    "myTasks.noActiveCourses": "Faol kurslar yo'q",
    "myTasks.noActiveCoursesDesc":
      "Siz hali hech qanday kurs boshlamadingiz. Yo'lingizni boshlash uchun katalogga tashrif buyuring.",
    "myTasks.browseCourses": "Kurslarni ko'rish",
    "myTasks.loadingProgress": "Jarayon yuklanmoqda...",
    "myTasks.continueLearning": "O'rganishni davom ettirish",
    "myTasks.percentCompleted": "% Bajarildi",
    "myTasks.progress": "Jarayon",
    "myTasks.loginRequired": "Jarayonni kuzating",
    "myTasks.loginRequiredDesc":
      "O'quv jarayonini kuzatish va to'xtatgan joyingizdan davom etish uchun tizimga kiring.",
    "myTasks.description": "To'xtatgan joyingizdan davom eting.",

    // ===================== ANALYTICS PAGE =====================
    "analytics.loginRequired": "Analitikangizni ko'ring",
    "analytics.loginRequiredDesc":
      "Ishlash ko'rsatkichlari, faollik xaritasi va mahorat o'sishini ko'rish uchun tizimga kiring.",
    "analytics.title": "Analitika",
    "analytics.subtitle":
      "Ishlash ko'rsatkichlari va mahorat o'sishini batafsil ko'ring.",
    "analytics.weeklyActivity": "Haftalik faollik",
    "analytics.yearlyContributions": "Yillik faollik",
    "analytics.noActivityThisWeek": "Bu hafta faollik yo'q",
    "analytics.youAreOnFire": "Siz ajoyibsiz!",
    "analytics.tasksSolvedThisWeek": "Bu hafta {count} ta vazifa yechildi.",
    "analytics.historicalData": "{dateRange} hafta uchun ma'lumotlar.",
    "analytics.totalSubmissions": "Jami yuborishlar",
    "analytics.maxStreak": "Maks. seriya",
    "analytics.currentStreak": "Joriy seriya",
    "analytics.less": "Kamroq",
    "analytics.more": "Ko'proq",
    "analytics.completionRate": "Bajarish foizi",
    "analytics.avgRuntime": "O'rtacha vaqt",
    "analytics.totalXP": "Jami XP",
    "analytics.loading": "Analitika yuklanmoqda...",
    "analytics.noActivity": "Faollik yo'q",
    "analytics.tasksCompleted": "{count} ta vazifa bajarildi",
    // Day names for weekly chart
    "analytics.day.mon": "Dush",
    "analytics.day.tue": "Sesh",
    "analytics.day.wed": "Chor",
    "analytics.day.thu": "Pay",
    "analytics.day.fri": "Jum",
    "analytics.day.sat": "Shan",
    "analytics.day.sun": "Yak",

    // ===================== ROADMAP PAGE =====================
    "roadmap.questionFocus": "Sizning asosiy yo'nalishingiz nima?",
    "roadmap.backendGo": "Backend (Go)",
    "roadmap.backendJava": "Backend (Java)",
    "roadmap.fullstack": "Fullstack",
    "roadmap.questionExperience": "Sizning tajribangiz qanday?",
    "roadmap.junior": "Junior (0-2 yil)",
    "roadmap.midLevel": "Middle (3-5 yil)",
    "roadmap.senior": "Senior (5+ yil)",
    "roadmap.questionGoal": "Sizning asosiy maqsadingiz nima?",
    "roadmap.landJob": "Yangi ish topish",
    "roadmap.getPromoted": "Lavozim olish",
    "roadmap.masterSkill": "Ma'lum mahoratni egallash",
    "roadmap.stepOf": "{step}-qadam (3 dan)",
    "roadmap.title": "Sizning shaxsiy yo'lingiz",
    "roadmap.regenerate": "Qayta yaratish",
    "roadmap.analyzingProfile": "Profil tahlili...",
    "roadmap.scanningMarket": "Bozor talablarini skanerlash...",
    "roadmap.mappingDeps": "Bog'liqliklarni xaritalash...",
    "roadmap.selectingResources": "Eng yaxshi resurslarni tanlash...",
    "roadmap.finalizing": "Yo'lni yakunlash...",
    "roadmap.loading": "Yo'l yuklanmoqda...",
    "roadmap.percentDone": "% Tayyor",
    "roadmap.goalAchieved": "Maqsadga erishildi",
    "roadmap.readyForInterviews": "Senior suhbatlariga tayyor",
    "roadmap.introTitle": "Sizning o'quv yo'lingiz",
    "roadmap.introDescription":
      "Bir necha savolga javob bering va bizning AI 900+ vazifalardan sizning maqsadlaringizga moslashtirilgan shaxsiy roadmap yaratadi.",
    "roadmap.featureAI": "AI-texnologiyalar",
    "roadmap.featureAIDesc": "Profilingiz asosida aqlli vazifa tanlash",
    "roadmap.featurePersonal": "Shaxsiylashtirilgan",
    "roadmap.featurePersonalDesc":
      "Tajribangiz va maqsadlaringizga moslashtirilgan",
    "roadmap.featureProgress": "Kuzatish",
    "roadmap.featureProgressDesc": "Vizual roadmap jarayonni kuzatish bilan",
    "roadmap.interestsHint": "Kamida bitta qiziqish sohasini tanlang",
    "roadmap.interestsError":
      "Davom etish uchun kamida bitta qiziqish sohasini tanlang",
    "roadmap.firstFree": "Birinchi generatsiya BEPUL",
    "roadmap.regeneratePremium": "Qayta generatsiya Premium bilan",
    "roadmap.regeneratePremiumTitle": "Qayta generatsiya uchun Premium kerak",
    "roadmap.regeneratePremiumDesc":
      "Cheksiz shaxsiy roadmaplar yaratish uchun obunani yangilang",
    "roadmap.yourPersonalRoadmap": "Sizning shaxsiy Roadmapingiz",
    "roadmap.startButton": "Mening Roadmapimni yaratish",
    "roadmap.questionFocusDesc": "Asosiy o'quv yo'nalishingizni tanlang",
    "roadmap.questionHours": "Haftasiga qancha vaqt ajrata olasiz?",
    // NEW: Variant selection UI
    "roadmap.chooseYourPath": "Yo'lingizni tanlang",
    "roadmap.variantsGenerated":
      "Maqsadlaringiz asosida {count} ta shaxsiy roadmap yaratdik",
    "roadmap.adjustPreferences": "Sozlamalarni o'zgartirish",
    "roadmap.startPath": "{name} yo'lini boshlash",
    "roadmap.recommended": "Tavsiya etiladi",
    "roadmap.tasks": "Vazifalar",
    "roadmap.expectedSalary": "Kutilgan maosh",
    "roadmap.topics": "Mavzular",
    "roadmap.fromCourses": "Kurslardan",
    "roadmap.firstTasks": "Birinchi vazifalar",
    "roadmap.clickToSelect": "Tanlash uchun bosing",
    "roadmap.selected": "Tanlangan",
    "roadmap.generateRoadmaps": "Roadmaplarni yaratish",
    "roadmap.wizardStep1Title": "Sizning tajribangiz",
    "roadmap.wizardStep1Subtitle": "Bilgan tillaringizni tanlang",
    "roadmap.wizardStep2Title": "Tajriba darajasi",
    "roadmap.wizardStep2Subtitle": "Qancha vaqtdan beri dasturlaysiz?",
    "roadmap.wizardStep3Title": "Qiziqishlaringiz",
    "roadmap.wizardStep3Subtitle": "Nimani o'rganmoqchisiz?",
    "roadmap.wizardStep4Title": "Maqsadingiz",
    "roadmap.wizardStep4Subtitle": "Nimaga erishmoqchisiz?",
    "roadmap.wizardStep5Title": "Vaqt ajratish",
    "roadmap.wizardStep5Subtitle": "Qancha vaqt ajrata olasiz?",

    // ===================== PAYMENTS PAGE =====================
    "payments.title": "Hisob-kitob va to'lovlar",
    "payments.description": "Obunani boshqaring va to'lov tarixini ko'ring.",
    "payments.currentPlan": "Joriy reja",
    "payments.professional": "Professional",
    "payments.activeDesc":
      "Obunangiz {date} da yangilanadi. Barcha funksiyalarga to'liq kirish.",
    "payments.freeStarter": "Bepul Boshlang'ich",
    "payments.freeDesc":
      "Siz bepul rejada. Practix ning to'liq imkoniyatlarini ochish uchun yangilang.",
    "payments.manageSubscription": "Obunani boshqarish",
    "payments.upgradePlan": "Rejani yangilash",
    "payments.paymentMethods": "To'lov usullari",
    "payments.visa": "VISA",
    "payments.cardEnding": "Visa {last4} bilan tugaydi",
    "payments.expires": "Muddati {date}",
    "payments.edit": "Tahrirlash",
    "payments.addPaymentMethod": "To'lov usulini qo'shish",
    "payments.paymentHistory": "To'lov tarixi",
    "payments.invoiceId": "Hisob-faktura ID",
    "payments.date": "Sana",
    "payments.descriptionCol": "Tavsif",
    "payments.amount": "Summa",
    "payments.status": "Holat",
    "payments.loadingHistory": "Tarix yuklanmoqda...",
    "payments.download": "Yuklab olish",

    // ===================== ADMIN DASHBOARD =====================
    "admin.title": "Metrika",
    "admin.subtitle": "Platforma statistikasi.",
    "admin.totalUsers": "Jami foydalanuvchilar",
    "admin.newUsers": "Yangilar (30 kun)",
    "admin.activeUsers": "Faollar (oylik)",
    "admin.totalSubmissions": "Jami yechimlar",
    "admin.activeSubscriptions": "Faol obunalar",
    "admin.thisMonth": "bu oyda",
    "admin.subscriptionsByPlan": "Reja bo'yicha obunalar",
    "admin.globalAccess": "To'liq kirish",
    "admin.courseAccess": "Kurs kirishi",
    "admin.subscribers": "obunachi",
    "admin.showMore": "Ko'proq ko'rsatish",
    "admin.showLess": "Kamroq",
    "admin.noActiveSubscriptions": "Faol obunalar yo'q",
    "admin.monthlyRevenue": "Oylik daromad",
    "admin.estimatedMonthly": "Taxminiy oylik",
    "admin.submissionsByStatus": "Yechimlar holati",
    "admin.noSubmissions": "Hali yechimlar yo'q",
    "admin.submissionsByDay": "Kunlik yechimlar (30 kun)",
    "admin.coursePopularity": "Kurslar mashhurligi",
    "admin.noEnrollmentData": "Ro'yxatdan o'tish ma'lumotlari yo'q",
    "admin.topCoursesByCompletion": "Tugatish bo'yicha top kurslar",
    "admin.course": "Kurs",
    "admin.completions": "Tugatishlar",
    "admin.rate": "Foiz",
    "admin.hardestTasks": "Eng qiyin vazifalar",
    "admin.task": "Vazifa",
    "admin.submissions": "Yechimlar",
    "admin.passRate": "Muvaffaqiyat",
    "admin.loginRequired": "Kirish talab qilinadi",
    "admin.loginRequiredDesc": "Admin paneliga kirish uchun tizimga kiring.",
    "admin.loading": "Panel yuklanmoqda...",
    "admin.statusPassed": "Qabul qilindi",
    "admin.statusFailed": "Rad etildi",
    "admin.statusError": "Xatolik",
    "admin.statusTimeout": "Vaqt tugadi",
    "admin.statusCompileError": "Kompilyatsiya xatosi",
    "admin.statusPending": "Kutilmoqda",
    "admin.enrolled": "yozilgan",
    "admin.completed": "tugatilgan",

    // AI Settings
    "admin.aiSettings.title": "AI Tutor sozlamalari",
    "admin.aiSettings.subtitle":
      "AI Tutor uchun kunlik so'rov limitlarini sozlang",
    "admin.aiSettings.enabled": "AI Tutor yoqilgan",
    "admin.aiSettings.disabled": "AI Tutor o'chirilgan",
    "admin.aiSettings.dailyLimits": "Kunlik so'rov limitlari",
    "admin.aiSettings.freeTier": "Bepul tarif",
    "admin.aiSettings.freeTierDesc": "Obunasiz foydalanuvchilar",
    "admin.aiSettings.courseTier": "Kurs tarifi",
    "admin.aiSettings.courseTierDesc":
      "Bitta kursga obuna bo'lgan foydalanuvchilar",
    "admin.aiSettings.premiumTier": "Premium tarif",
    "admin.aiSettings.premiumTierDesc":
      "Global premium kirish huquqiga ega foydalanuvchilar",
    "admin.aiSettings.promptEngineeringTier": "Prompt Engineering",
    "admin.aiSettings.promptEngineeringTierDesc": "PE kursi uchun maxsus limit",
    "admin.aiSettings.saveChanges": "O'zgarishlarni saqlash",
    "admin.aiSettings.saving": "Saqlanmoqda...",
    "admin.aiSettings.saveSuccess": "Sozlamalar muvaffaqiyatli saqlandi!",
    "admin.aiSettings.loadError": "AI sozlamalarini yuklashda xatolik",
    "admin.aiSettings.saveError": "AI sozlamalarini saqlashda xatolik",

    // Bug Reports
    "admin.bugReports.title": "Xatolik hisobotlari",
    "admin.bugReports.subtitle": "Foydalanuvchilar yuborgan xatoliklar",
    "admin.bugReports.allStatuses": "Barcha holatlar",
    "admin.bugReports.noReports": "Xatolik hisobotlari topilmadi",
    "admin.bugReports.loadError": "Xatolik hisobotlarini yuklashda xato",
    "admin.bugReports.description": "Tavsif",
    "admin.bugReports.relatedTask": "Bog'liq vazifa",
    "admin.bugReports.metadata": "Metama'lumotlar",
    "admin.bugReports.status.open": "Ochiq",
    "admin.bugReports.status.in-progress": "Jarayonda",
    "admin.bugReports.status.resolved": "Hal qilindi",
    "admin.bugReports.status.closed": "Yopildi",
    "admin.bugReports.status.wont-fix": "Tuzatilmaydi",

    // User Search
    "admin.userSearch.title": "Foydalanuvchilarni qidirish",
    "admin.userSearch.subtitle": "Email yoki ism bo'yicha qidirish",
    "admin.userSearch.placeholder": "Email yoki ism kiriting...",
    "admin.userSearch.search": "Qidirish",
    "admin.userSearch.minChars": "Kamida 2 ta belgi kiriting",
    "admin.userSearch.searchError": "Foydalanuvchilarni qidirishda xatolik",
    "admin.userSearch.noResults": "Foydalanuvchilar topilmadi",
    "admin.userSearch.noName": "Ismsiz",
    "admin.userSearch.registered": "Ro'yxatdan o'tgan",
    "admin.userSearch.lastActive": "Oxirgi faollik",
    "admin.userSearch.submissions": "yuborishlar",
    "admin.userSearch.courses": "kurslar",
    "admin.userSearch.hint":
      "Email yoki ism bo'yicha foydalanuvchilarni qidiring",
    "admin.userSearch.banned": "Bloklangan",
    "admin.userSearch.ban": "Bloklash",
    "admin.userSearch.unban": "Blokdan chiqarish",
    "admin.userSearch.banReason": "Bloklash sababi",
    "admin.userSearch.banError": "Foydalanuvchini bloklashda xatolik",
    "admin.userSearch.unbanError":
      "Foydalanuvchini blokdan chiqarishda xatolik",
    "admin.userSearch.banModalTitle": "Foydalanuvchini bloklash",
    "admin.userSearch.banModalDesc":
      "Siz foydalanuvchini bloklash arafasidasiz",
    "admin.userSearch.banReasonLabel": "Bloklash sababi",
    "admin.userSearch.banReasonPlaceholder": "Bloklash sababini kiriting...",
    "admin.userSearch.confirmBan": "Bloklash",

    // ===================== ADMIN PAYMENTS =====================
    "admin.payments.title": "To'lovlarni boshqarish",
    "admin.payments.subtitle": "To'lovlar, obunalar va daromadlar",
    "admin.payments.tab.revenue": "Daromad",
    "admin.payments.tab.subscriptions": "Obunalar",
    "admin.payments.tab.payments": "To'lovlar",
    "admin.payments.loadError": "Ma'lumotlarni yuklashda xatolik",
    "admin.payments.thisMonth": "Bu oy",
    "admin.payments.lastMonth": "O'tgan oy",
    "admin.payments.totalRevenue": "Jami daromad",
    "admin.payments.refunded": "Qaytarilgan",
    "admin.payments.transactions": "tranzaksiya",
    "admin.payments.byProvider": "Provayder bo'yicha",
    "admin.payments.noData": "Ma'lumot yo'q",
    "admin.payments.oneTimePurchases": "Bir martalik xaridlar",
    "admin.payments.purchases": "xarid",
    "admin.payments.allStatuses": "Barcha holatlar",
    "admin.payments.allProviders": "Barcha provayderlar",
    "admin.payments.total": "Jami",
    "admin.payments.refund": "Qaytarish",
    "admin.payments.noPayments": "To'lovlar topilmadi",
    "admin.payments.expires": "Tugaydi",
    "admin.payments.payments": "to'lov",
    "admin.payments.extend": "Uzaytirish",
    "admin.payments.cancelSub": "Bekor qilish",
    "admin.payments.noSubscriptions": "Obunalar topilmadi",
    "admin.payments.confirmCancel": "Obunani bekor qilmoqchimisiz",
    "admin.payments.refundError": "To'lovni qaytarishda xatolik",
    "admin.payments.extendError": "Obunani uzaytirishda xatolik",
    "admin.payments.cancelError": "Obunani bekor qilishda xatolik",
    "admin.payments.refundModalTitle": "To'lovni qaytarish",
    "admin.payments.refundModalDesc": "Siz qaytarmoqchisiz",
    "admin.payments.for": "uchun",
    "admin.payments.refundReasonLabel": "Qaytarish sababi",
    "admin.payments.refundReasonPlaceholder": "Qaytarish sababini kiriting...",
    "admin.payments.confirmRefund": "Qaytarish",
    "admin.payments.extendModalTitle": "Obunani uzaytirish",
    "admin.payments.extendModalDesc": "Obunani uzaytirish",
    "admin.payments.extendDaysLabel": "Uzaytirish kunlari",
    "admin.payments.confirmExtend": "Uzaytirish",

    // ===================== COMMON =====================
    "common.loading": "Yuklanmoqda...",
    "common.error": "Xatolik",
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.premium": "Premium",
    "common.back": "Orqaga",
    "common.next": "Keyingi",
    "common.submit": "Yuborish",
    "common.close": "Yopish",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.view": "Ko'rish",
    "common.search": "Qidirish",
    "common.filter": "Filtr",
    "common.sort": "Saralash",
    "common.all": "Hammasi",
    "common.none": "Yo'q",
    "common.yes": "Ha",
    "common.no": "Yo'q",
    "common.ok": "OK",
    "common.confirm": "Tasdiqlash",
    "common.retry": "Qayta urinish",
    "common.refresh": "Yangilash",
    "common.saveChanges": "O'zgarishlarni saqlash",
  },
};

// ===================== TIME FORMATTING =====================
// Format time strings like "2h", "30m", "1h 30m" to localized versions
const TIME_UNITS: Record<Language, { h: string; m: string; s: string }> = {
  en: { h: "h", m: "m", s: "s" },
  ru: { h: "ч", m: "м", s: "с" },
  uz: { h: "s", m: "d", s: "s" }, // s = soat (hour), d = daqiqa (minute) - lowercase
};

function formatTime(time: string, language: Language): string {
  if (!time) return "";

  const units = TIME_UNITS[language];

  // Handle formats like "2h", "30m", "2h 30m", "12h"
  return time
    .replace(/(\d+)h/g, `$1${units.h}`)
    .replace(/(\d+)m/g, `$1${units.m}`)
    .replace(/(\d+)s/g, `$1${units.s}`);
}

// ===================== PLURALIZATION =====================
// Russian pluralization rules for words like тема/темы/тем
type PluralForms = {
  one: string; // 1 тема, 21 тема
  few: string; // 2-4 темы, 22-24 темы
  many: string; // 5-20 тем, 25-30 тем
};

const PLURAL_WORDS: Record<Language, Record<string, PluralForms>> = {
  en: {
    topic: { one: "topic", few: "topics", many: "topics" },
    task: { one: "task", few: "tasks", many: "tasks" },
    module: { one: "module", few: "modules", many: "modules" },
    hour: { one: "hour", few: "hours", many: "hours" },
    minute: { one: "min", few: "min", many: "min" },
  },
  ru: {
    topic: { one: "тема", few: "темы", many: "тем" },
    task: { one: "задача", few: "задачи", many: "задач" },
    module: { one: "модуль", few: "модуля", many: "модулей" },
    hour: { one: "час", few: "часа", many: "часов" },
    minute: { one: "минута", few: "минуты", many: "минут" },
  },
  uz: {
    topic: { one: "mavzu", few: "mavzu", many: "mavzu" },
    task: { one: "vazifa", few: "vazifa", many: "vazifa" },
    module: { one: "modul", few: "modul", many: "modul" },
    hour: { one: "soat", few: "soat", many: "soat" },
    minute: { one: "daqiqa", few: "daqiqa", many: "daqiqa" },
  },
};

function getPluralForm(
  count: number,
  language: Language,
): "one" | "few" | "many" {
  if (language === "uz") {
    // Uzbek doesn't have plural forms
    return "one";
  }

  if (language === "en") {
    return count === 1 ? "one" : "many";
  }

  // Russian pluralization rules
  const absCount = Math.abs(count);
  const lastTwo = absCount % 100;
  const lastOne = absCount % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return "many";
  }
  if (lastOne === 1) {
    return "one";
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return "few";
  }
  return "many";
}

function pluralize(count: number, word: string, language: Language): string {
  const forms = PLURAL_WORDS[language]?.[word] || PLURAL_WORDS.en[word];
  if (!forms) return `${count} ${word}`;

  const form = getPluralForm(count, language);
  return `${count} ${forms[form]}`;
}

// ===================== DIFFICULTY LABELS =====================
const DIFFICULTY_LABELS: Record<Language, Record<string, string>> = {
  en: { easy: "Easy", medium: "Medium", hard: "Hard" },
  ru: { easy: "Легко", medium: "Средне", hard: "Сложно" },
  uz: { easy: "Oson", medium: "O'rtacha", hard: "Qiyin" },
};

// Hook for UI translations
export function useUITranslation() {
  const { language } = useLanguage();

  const tUI = useCallback(
    (key: string): string => {
      return UI_TRANSLATIONS[language][key] || UI_TRANSLATIONS.en[key] || key;
    },
    [language],
  );

  // Format time to localized version
  const formatTimeLocalized = useCallback(
    (time: string): string => {
      return formatTime(time, language);
    },
    [language],
  );

  // Pluralize a word based on count
  const plural = useCallback(
    (count: number, word: string): string => {
      return pluralize(count, word, language);
    },
    [language],
  );

  // Translate difficulty level
  const difficulty = useCallback(
    (level: string): string => {
      return (
        DIFFICULTY_LABELS[language]?.[level] ||
        DIFFICULTY_LABELS.en[level] ||
        level
      );
    },
    [language],
  );

  return { tUI, language, formatTimeLocalized, plural, difficulty };
}
