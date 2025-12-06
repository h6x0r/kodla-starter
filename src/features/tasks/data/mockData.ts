
import { Task, Topic, Submission } from '../../../types';

export const MOCK_TASK: Task = {
  id: 'task1',
  slug: 'two-sum',
  title: 'Two Sum',
  difficulty: 'easy',
  tags: ['arrays', 'hash-map'],
  isPremium: false,
  youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA', 
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

|||Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

|||Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

|||Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

***Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.
`,
  initialCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
  solutionCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("No two sum solution");
    }
}`,
  hints: ["Try using a HashMap to store complements."],
  estimatedTime: '25m'
};

export const MOCK_SUBMISSIONS: Submission[] = [
  { 
    id: 's1', 
    status: 'failed', 
    score: 0, 
    runtime: '15ms', 
    createdAt: '2023-10-25T10:00:00Z', 
    code: 'Bad code',
    message: '> Build Successful\n> Running Tests...\n> Test Case 1: PASSED (2ms)\n> Test Case 2: FAILED\n   Input:    [2,7,11,15], 9\n   Expected: [0,1]\n   Output:   []'
  },
  { 
    id: 's2', 
    status: 'passed', 
    score: 100, 
    runtime: '2ms', 
    createdAt: '2023-10-25T10:30:00Z', 
    code: 'Good code',
    message: '> Build Successful\n> Running Tests...\n> Test Case 1: PASSED (2ms)\n> Test Case 2: PASSED (1ms)\n> Test Case 3: PASSED (5ms)\n\n[SUCCESS] All test cases passed!'
  },
];

export const RECENT_TASKS: Task[] = [
  {
    id: 'task101', slug: 'two-sum', title: 'Two Sum', difficulty: 'easy', tags: ['array'], isPremium: false, initialCode: '', 
    description: '', status: 'completed', estimatedTime: '20m', youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA',
    solutionCode: `// Two Sum Solution\nclass Solution { ... }`
  },
  {
    id: 'task102', slug: 'lru-cache', title: 'LRU Cache', difficulty: 'medium', tags: ['design'], isPremium: true, initialCode: '', 
    description: '', status: 'completed', estimatedTime: '45m', youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA',
    solutionCode: `// LRU Cache Solution`
  },
  {
    id: 'task103', slug: 'merge-k-lists', title: 'Merge K Sorted Lists', difficulty: 'hard', tags: ['heap'], isPremium: false, initialCode: '', 
    description: '', status: 'pending', estimatedTime: '60m', youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA',
    solutionCode: `// Merge K Lists Solution`
  },
  {
    id: 'task104', slug: 'go-routines-basic', title: 'Goroutine Basics', difficulty: 'easy', tags: ['go'], isPremium: false, initialCode: '', 
    description: '', status: 'pending', estimatedTime: '15m', youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA',
    solutionCode: `// Goroutine Basics Solution`
  }
];

// --- TOPIC GENERATORS ---

const generateTasksForTopic = (topicName: string, lang: 'go' | 'java' | 'general' = 'general'): Task[] => {
  const isGo = lang === 'go';
  return [
    {
      id: `t_${topicName}_1`,
      slug: `${topicName.toLowerCase().replace(/\s/g, '-')}-basics`,
      title: `${topicName} Basics`,
      difficulty: 'easy',
      tags: [lang, topicName.toLowerCase()],
      isPremium: false,
      initialCode: isGo ? `package main\n\nfunc main() {\n\t// Learn ${topicName}\n}` : `public class Main {\n\tpublic static void main(String[] args) {\n\t\t// Learn ${topicName}\n\t}\n}`,
      solutionCode: isGo ? `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Solution for ${topicName}")\n}` : `public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Solution for ${topicName}");\n\t}\n}`,
      description: `Introduction to ${topicName}.\n\n|||Example 1:\nInput: none\nOutput: "Hello ${topicName}"\n\n***Constraints:\n- Use standard library`,
      status: 'pending',
      estimatedTime: '15m',
      youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA'
    },
    {
      id: `t_${topicName}_2`,
      slug: `${topicName.toLowerCase().replace(/\s/g, '-')}-advanced`,
      title: `Advanced ${topicName}`,
      difficulty: 'medium',
      tags: [lang, topicName.toLowerCase(), 'advanced'],
      isPremium: true,
      initialCode: isGo ? `package main\n\n// Advanced ${topicName} implementation` : `public class Solution {\n\t// Advanced logic\n}`,
      solutionCode: isGo ? `package main\n\n// Advanced ${topicName} Solution` : `public class Solution {\n\t// Advanced logic Solution\n}`,
      description: `Deep dive into ${topicName} patterns.\n\n|||Example 1:\nInput: complex\nOutput: simple\n`,
      status: 'pending',
      estimatedTime: '45m',
      youtubeUrl: 'https://www.youtube.com/watch?v=R3GfuzLMPkA'
    }
  ];
};

// 1. GO Lang Topics
export const GO_TOPIC_NAMES = [
  "cache", "circuitx", "configx", "encodingx", "genericsx", "grpcx", "interfaces", "metricsx", 
  "pointersx", "ratelimit", "sqlprac", "syncx", "testingx", "webappx", "channelsx", "concurrency", 
  "datastructsx", "errorsx", "goroutinesx", "httpx", "loggingx", "panicrecover", "profilingx", 
  "retryx", "structinit", "timeutils", "gin-framework", "echo-framework", "fiber-framework",
  "interview-concurrency", "interview-gc", "interview-scheduler"
];
export const GO_TOPICS: Topic[] = GO_TOPIC_NAMES.sort().map((name, idx) => ({
  id: name,
  title: name.charAt(0).toUpperCase() + name.slice(1),
  description: `Mastering ${name} in Go.`,
  difficulty: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
  estimatedTime: idx % 3 === 0 ? '1.5h' : '3h',
  tasks: generateTasksForTopic(name, 'go')
}));

// 2. JAVA Topics
export const JAVA_TOPIC_NAMES = [
  "OOP Basics", "Collections", "Streams API", "Exceptions", "Multithreading", "JVM Internals",
  "Generics", "Reflection", "Spring Boot", "Spring Data", "Hibernate", "Microservices", "Security", "Testing"
];
export const JAVA_TOPICS: Topic[] = JAVA_TOPIC_NAMES.map((name, idx) => ({
  id: name.toLowerCase().replace(/\s/g, '-'),
  title: name,
  description: `Deep dive into ${name}.`,
  difficulty: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
  estimatedTime: idx % 3 === 0 ? '2h' : '5h',
  tasks: generateTasksForTopic(name, 'java')
}));

// 3. ALGORITHMS Topics
export const ALGO_TOPIC_NAMES = [
  "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List",
  "Trees", "Tries", "Heap / Priority Queue", "Backtracking", "Graphs", "Dynamic Programming"
];
export const ALGO_TOPICS: Topic[] = ALGO_TOPIC_NAMES.map((name, idx) => ({
  id: name.toLowerCase().replace(/\s/g, '-'),
  title: name,
  description: `Essential patterns for ${name}.`,
  difficulty: idx > 8 ? 'hard' : idx > 4 ? 'medium' : 'easy',
  estimatedTime: '4h',
  tasks: generateTasksForTopic(name, 'general')
}));

// 4. SYSTEM DESIGN Topics
export const SYS_TOPIC_NAMES = [
  "Load Balancing", "Caching Strategies", "Database Sharding", "Replication", "CAP Theorem",
  "Message Queues", "API Design", "Security & Auth"
];
export const SYS_TOPICS: Topic[] = SYS_TOPIC_NAMES.map((name, idx) => ({
  id: name.toLowerCase().replace(/\s/g, '-'),
  title: name,
  description: `Architecting systems with ${name}.`,
  difficulty: 'hard',
  estimatedTime: '3.5h',
  tasks: generateTasksForTopic(name, 'general')
}));