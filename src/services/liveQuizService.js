import { db } from './firebase'
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  collection,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

export const liveQuizService = {
  // Create a new live quiz session
  createQuizSession: async (hostId, quizConfig) => {
    try {
      const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionData = {
        id: sessionId,
        hostId,
        status: 'waiting', // waiting, active, completed
        currentQuestion: 0,
        totalQuestions: quizConfig.questions.length,
        questions: quizConfig.questions,
        timePerQuestion: quizConfig.timePerQuestion || 45,
        participants: {},
        createdAt: serverTimestamp(),
        startedAt: null,
        completedAt: null,
        timeLeft: quizConfig.timePerQuestion || 45,
        lastStateUpdate: serverTimestamp(),
        version: 1
      }
      
      await setDoc(doc(db, 'live_quizzes', sessionId), sessionData)
      return { success: true, sessionId }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Join a quiz session as participant
  joinQuizSession: async (sessionId, participantId, participantName) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      await updateDoc(sessionRef, {
        [`participants.${participantId}`]: {
          id: participantId,
          name: participantName,
          score: 0,
          answers: [],
          joinedAt: serverTimestamp(),
          isActive: true
        }
      })
      
      return { success: true, sessionData: sessionDoc.data() }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Start the quiz (host only)
  startQuiz: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      const data = sessionDoc.data()
      
      await updateDoc(sessionRef, {
        status: 'active',
        startedAt: serverTimestamp(),
        currentQuestion: 0,
        timeLeft: data.timePerQuestion
      })
      
      // Start the timer for this question
      liveQuizService.startQuestionTimer(sessionId)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Start question timer (internal use)
  startQuestionTimer: async (sessionId) => {
    const sessionRef = doc(db, 'live_quizzes', sessionId)
    
    const timer = setInterval(async () => {
      try {
        const sessionDoc = await getDoc(sessionRef)
        if (!sessionDoc.exists()) {
          clearInterval(timer)
          return
        }
        
        const data = sessionDoc.data()
        
        // Don't update timer if quiz is paused or stopped
        if (data.status === 'paused' || data.status === 'stopped' || data.status === 'completed') {
          clearInterval(timer)
          return
        }
        
        const newTimeLeft = Math.max(0, (data.timeLeft || 0) - 1)
        
        await updateDoc(sessionRef, {
          timeLeft: newTimeLeft,
          lastStateUpdate: serverTimestamp(),
          version: (data.version || 1) + 1
        })
        
        if (newTimeLeft <= 0) {
          clearInterval(timer)
          // Auto-advance to next question
          const nextQuestionIndex = data.currentQuestion + 1
          if (nextQuestionIndex < data.totalQuestions) {
            await liveQuizService.nextQuestion(sessionId, nextQuestionIndex)
          } else {
            await updateDoc(sessionRef, {
              status: 'completed',
              completedAt: serverTimestamp()
            })
          }
        }
      } catch (error) {
        console.error('Timer update error:', error)
        clearInterval(timer)
      }
    }, 1000)
  },

  // Move to next question (host only)
  nextQuestion: async (sessionId, questionIndex) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      const data = sessionDoc.data()
      const isLastQuestion = questionIndex >= data.totalQuestions - 1
      
      await updateDoc(sessionRef, {
        currentQuestion: questionIndex,
        timeLeft: data.timePerQuestion,
        status: isLastQuestion ? 'completed' : 'active',
        completedAt: isLastQuestion ? serverTimestamp() : null
      })
      
      // Start timer for new question if not completed
      if (!isLastQuestion) {
        liveQuizService.startQuestionTimer(sessionId)
      }
      
      return { success: true, isCompleted: isLastQuestion }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Submit participant answer
  submitAnswer: async (sessionId, participantId, questionIndex, answer) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      await updateDoc(sessionRef, {
        [`participants.${participantId}.answers.${questionIndex}`]: {
          answer,
          timestamp: serverTimestamp()
        }
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Update participant score
  updateScore: async (sessionId, participantId, newScore) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      await updateDoc(sessionRef, {
        [`participants.${participantId}.score`]: newScore
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Real-time listener for quiz session updates
  subscribeToQuizSession: (sessionId, callback) => {
    const sessionRef = doc(db, 'live_quizzes', sessionId)
    
    return onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: doc.data() })
      } else {
        callback({ success: false, error: 'Quiz session not found' })
      }
    }, (error) => {
      callback({ success: false, error: error.message })
    })
  },

  // Get quiz session data
  getQuizSession: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      return { success: true, data: sessionDoc.data() }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Host Controls
  
  // Pause quiz (host only)
  pauseQuiz: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      await updateDoc(sessionRef, {
        status: 'paused',
        pausedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Resume quiz (host only)
  resumeQuiz: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      const data = sessionDoc.data()
      
      await updateDoc(sessionRef, {
        status: 'active',
        resumedAt: serverTimestamp()
      })
      
      // Restart timer for current question
      liveQuizService.startQuestionTimer(sessionId)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Stop quiz early (host only)
  stopQuiz: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      await updateDoc(sessionRef, {
        status: 'stopped',
        stoppedAt: serverTimestamp(),
        completedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Manually advance to next question (host only)
  forceNextQuestion: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      const data = sessionDoc.data()
      const nextQuestionIndex = data.currentQuestion + 1
      
      if (nextQuestionIndex >= data.totalQuestions) {
        // Complete the quiz
        await updateDoc(sessionRef, {
          status: 'completed',
          completedAt: serverTimestamp()
        })
        return { success: true, isCompleted: true }
      }
      
      await updateDoc(sessionRef, {
        currentQuestion: nextQuestionIndex,
        timeLeft: data.timePerQuestion,
        status: 'active'
      })
      
      // Start timer for new question
      liveQuizService.startQuestionTimer(sessionId)
      
      return { success: true, isCompleted: false }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Reset quiz to beginning (host only)
  resetQuiz: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'live_quizzes', sessionId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (!sessionDoc.exists()) {
        throw new Error('Quiz session not found')
      }
      
      const data = sessionDoc.data()
      
      await updateDoc(sessionRef, {
        status: 'waiting',
        currentQuestion: 0,
        timeLeft: data.timePerQuestion,
        startedAt: null,
        completedAt: null,
        pausedAt: null,
        resumedAt: null,
        stoppedAt: null,
        participants: {} // Clear all participant answers
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}