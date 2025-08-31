import { QUIZ_CATEGORIES, QUIZ_CONFIG } from '../utils/constants'

// Mock quiz data - in a real app, this would come from an API
const mockQuizzes = {
  algorithms: [
    {
      id: 1,
      question: "What is the time complexity of Bubble Sort in the worst case?",
      options: ["O(n)", "O(n²)", "O(n log n)", "O(1)"],
      correctAnswer: 1,
      explanation: "Bubble Sort has O(n²) time complexity in the worst case because it requires nested loops to compare and swap elements."
    },
    {
      id: 2,
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
      correctAnswer: 1,
      explanation: "Quick Sort has an average-case time complexity of O(n log n), making it one of the most efficient sorting algorithms."
    }
  ],
  'data-structures': [
    {
      id: 3,
      question: "What is the time complexity of accessing an element in an array?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      correctAnswer: 0,
      explanation: "Array access is O(1) because you can directly access any element using its index."
    },
    {
      id: 4,
      question: "Which data structure follows LIFO principle?",
      options: ["Queue", "Stack", "Tree", "Graph"],
      correctAnswer: 1,
      explanation: "A Stack follows the Last In, First Out (LIFO) principle."
    }
  ],
  'problem-solving': [
    {
      id: 5,
      question: "What is the optimal substructure property in dynamic programming?",
      options: ["Problems can be solved by combining solutions to subproblems", "Problems must have overlapping subproblems", "Problems must be solved recursively", "Problems must have a greedy choice property"],
      correctAnswer: 0,
      explanation: "Optimal substructure means that the optimal solution to a problem can be constructed from optimal solutions to its subproblems."
    }
  ]
}

export const quizService = {
  // Get all quiz categories
  getCategories: () => {
    return Promise.resolve(QUIZ_CATEGORIES)
  },

  // Get questions for a specific category
  getQuestions: (categoryId, count = QUIZ_CONFIG.MAX_QUESTIONS) => {
    const questions = mockQuizzes[categoryId] || []
    const shuffled = questions.sort(() => Math.random() - 0.5)
    return Promise.resolve(shuffled.slice(0, Math.min(count, questions.length)))
  },

  // Submit quiz answers and get results
  submitQuiz: (categoryId, answers, timeSpent) => {
    const questions = mockQuizzes[categoryId] || []
    let correctAnswers = 0
    
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / questions.length) * 100)
    const passed = score >= QUIZ_CONFIG.PASSING_SCORE

    const result = {
      categoryId,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent,
      passed,
      timestamp: new Date().toISOString()
    }

    return Promise.resolve(result)
  },

  // Get quiz history for a user
  getQuizHistory: () => {
    // In a real app, this would fetch from localStorage or API
    const history = localStorage.getItem('quiz_history')
    return Promise.resolve(history ? JSON.parse(history) : [])
  },

  // Save quiz result to history
  saveQuizResult: (result) => {
    const history = quizService.getQuizHistory()
    const updatedHistory = [result, ...history].slice(0, 50) // Keep last 50 results
    localStorage.setItem('quiz_history', JSON.stringify(updatedHistory))
    return Promise.resolve(result)
  }
}
