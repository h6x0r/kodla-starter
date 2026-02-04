// Wizard options configuration - must match test expectations

export const LANGUAGE_OPTIONS = [
  { id: "python", label: "Python", icon: "🐍" },
  { id: "javascript", label: "JavaScript", icon: "🟨" },
  { id: "typescript", label: "TypeScript", icon: "🔷" },
  { id: "java", label: "Java", icon: "☕" },
  { id: "go", label: "Go", icon: "🐹" },
  { id: "csharp", label: "C#", icon: "💜" },
  { id: "cpp", label: "C/C++", icon: "⚙️" },
  { id: "rust", label: "Rust", icon: "🦀" },
  { id: "ruby", label: "Ruby", icon: "💎" },
  { id: "php", label: "PHP", icon: "🐘" },
  { id: "kotlin", label: "Kotlin", icon: "🟣" },
  { id: "swift", label: "Swift", icon: "🍎" },
];

export const EXPERIENCE_OPTIONS = [
  { id: 0, label: "No experience", desc: "Just starting out" },
  { id: 1, label: "< 1 year", desc: "Beginner" },
  { id: 2, label: "1-2 years", desc: "Junior level" },
  { id: 3, label: "3-5 years", desc: "Mid level" },
  { id: 5, label: "5+ years", desc: "Senior level" },
];

export const INTEREST_OPTIONS = [
  {
    id: "backend",
    label: "Backend Development",
    icon: "🔧",
    desc: "APIs, databases, servers",
  },
  {
    id: "go",
    label: "Go Programming",
    icon: "🐹",
    desc: "Concurrency, microservices",
  },
  {
    id: "java",
    label: "Java Ecosystem",
    icon: "☕",
    desc: "Spring, enterprise",
  },
  {
    id: "python",
    label: "Python & Data",
    icon: "🐍",
    desc: "ML, analysis, automation",
  },
  {
    id: "ai-ml",
    label: "AI & Machine Learning",
    icon: "🤖",
    desc: "Deep learning, LLMs",
  },
  {
    id: "algorithms",
    label: "Algorithms & DS",
    icon: "🧮",
    desc: "Problem solving, interviews",
  },
  {
    id: "software-design",
    label: "Software Design",
    icon: "🏗️",
    desc: "SOLID, patterns, architecture",
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    icon: "☁️",
    desc: "CI/CD, containers, infra",
  },
];

export const GOAL_OPTIONS = [
  {
    id: "first-job",
    label: "Find a Job",
    icon: "💼",
    desc: "Interview prep, portfolio, market-ready skills",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "senior",
    label: "Reach Senior Level",
    icon: "📈",
    desc: "Architecture, leadership, best practices",
    color: "from-emerald-400 to-green-500",
  },
  {
    id: "startup",
    label: "Build a Startup",
    icon: "🚀",
    desc: "Full-stack skills, MVP development",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "master-skill",
    label: "Master a Skill",
    icon: "🎯",
    desc: "Deep expertise in specific area",
    color: "from-purple-400 to-pink-500",
  },
];

export const HOURS_OPTIONS = [
  { value: 5, label: "5 hrs/week", desc: "Light pace" },
  { value: 10, label: "10 hrs/week", desc: "Steady" },
  { value: 15, label: "15 hrs/week", desc: "Focused" },
  { value: 20, label: "20+ hrs/week", desc: "Intensive" },
];

export const MONTHS_OPTIONS = [
  { value: 3, label: "3 months", desc: "Sprint" },
  { value: 6, label: "6 months", desc: "Standard" },
  { value: 9, label: "9 months", desc: "Thorough" },
  { value: 12, label: "12 months", desc: "Comprehensive" },
];

export const WIZARD_STEPS = [
  {
    id: "languages",
    title: "Your Background",
    subtitle: "Select languages you know",
  },
  {
    id: "experience",
    title: "Experience Level",
    subtitle: "How long have you been coding?",
  },
  {
    id: "interests",
    title: "Your Interests",
    subtitle: "What do you want to learn?",
  },
  {
    id: "goal",
    title: "Your Goal",
    subtitle: "What do you want to achieve?",
  },
  {
    id: "time",
    title: "Time Commitment",
    subtitle: "How much time can you dedicate?",
  },
];
