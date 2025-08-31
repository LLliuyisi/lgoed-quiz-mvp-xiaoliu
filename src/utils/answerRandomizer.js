// Answer randomization utility to prevent cheating
export class AnswerRandomizer {
  constructor(userId = null, sessionId = null) {
    // Create a unique seed combining user ID and session ID for per-session randomization
    const userHash = userId ? this.hashCode(userId) : Math.floor(Math.random() * 1000000)
    const sessionHash = sessionId ? this.hashCode(sessionId) : Date.now()
    this.combinedSeed = userHash + sessionHash
  }

  // Simple hash function to create consistent seed from user ID
  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Seeded random number generator for consistent randomization per user
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Shuffle array using Fisher-Yates algorithm with combined user+session seed
  shuffleWithSeed(array, questionIndex) {
    const shuffled = [...array]
    const seed = this.combinedSeed + questionIndex * 1000 // Different seed per question
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomValue = this.seededRandom(seed + i)
      const j = Math.floor(randomValue * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }

  // Randomize question answers and maintain correct answer mapping
  randomizeQuestion(question, questionIndex) {
    const originalOptions = [...question.options]
    const originalCorrectIndex = question.correctAnswer
    const originalCorrectAnswer = originalOptions[originalCorrectIndex]

    // Create mapping array to track original indices
    const optionMapping = originalOptions.map((option, index) => ({
      option,
      originalIndex: index
    }))

    // Shuffle the options with user-specific seed
    const shuffledMapping = this.shuffleWithSeed(optionMapping, questionIndex)
    
    // Extract shuffled options and find new correct answer index
    const shuffledOptions = shuffledMapping.map(item => item.option)
    const newCorrectIndex = shuffledMapping.findIndex(
      item => item.option === originalCorrectAnswer
    )

    return {
      ...question,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
      originalMapping: shuffledMapping.map(item => item.originalIndex)
    }
  }

  // Convert user's answer back to original index for scoring
  convertToOriginalIndex(userAnswerIndex, originalMapping) {
    if (userAnswerIndex === null || userAnswerIndex < 0 || userAnswerIndex >= originalMapping.length) {
      return null
    }
    return originalMapping[userAnswerIndex]
  }

  // Randomize all questions in a quiz
  randomizeQuiz(questions) {
    return questions.map((question, index) => 
      this.randomizeQuestion(question, index)
    )
  }
}

// Factory function to create randomizer instance
export const createAnswerRandomizer = (userId = null, sessionId = null) => {
  return new AnswerRandomizer(userId, sessionId)
}

// Utility to generate a unique user session ID
export const generateUserSessionId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Utility to generate a unique quiz session ID
export const generateQuizSessionId = () => {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}