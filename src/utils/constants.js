// Quiz configuration
export const QUIZ_CONFIG = {
  DEFAULT_TIME_LIMIT: 300, // 5 minutes in seconds
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 20,
  PASSING_SCORE: 70
}

// Learning module configuration
export const LEARNING_CONFIG = {
  MODULES: [
    {
      id: 'intro-algorithms',
      title: 'Introduction to Algorithms',
      description: 'Learn the basics of algorithm design and analysis',
      duration: '2-3 hours',
      difficulty: 'Beginner'
    },
    {
      id: 'data-structures',
      title: 'Data Structures Fundamentals',
      description: 'Master arrays, linked lists, and basic data structures',
      duration: '3-4 hours',
      difficulty: 'Beginner'
    },
    {
      id: 'advanced-algorithms',
      title: 'Advanced Algorithms',
      description: 'Explore dynamic programming and graph algorithms',
      duration: '4-5 hours',
      difficulty: 'Intermediate'
    }
  ]
}

// Quiz categories
export const QUIZ_CATEGORIES = [
  {
    id: 'algorithms',
    name: 'Algorithms',
    description: 'Sorting, searching, and optimization algorithms',
    questionCount: 15
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    description: 'Arrays, linked lists, trees, and graphs',
    questionCount: 12
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Dynamic programming and greedy algorithms',
    questionCount: 18
  }
]

// API endpoints (for future use)
export const API_ENDPOINTS = {
  QUIZZES: '/api/quizzes',
  QUESTIONS: '/api/questions',
  USERS: '/api/users',
  PROGRESS: '/api/progress'
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'user_progress',
  QUIZ_RESULTS: 'quiz_results',
  USER_PREFERENCES: 'user_preferences'
}
