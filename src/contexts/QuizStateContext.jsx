import React, { createContext, useContext, useReducer, useEffect } from 'react'

const QuizStateContext = createContext()

const initialState = {
  sessionId: null,
  status: 'idle', // idle, waiting, active, completed, error
  currentQuestion: 0,
  totalQuestions: 0,
  questions: [],
  participants: {},
  timeLeft: 0,
  timePerQuestion: 45,
  version: 0,
  lastUpdate: null,
  hostId: null,
  isLive: false
}

function quizStateReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        status: 'waiting',
        isLive: true
      }
    
    case 'UPDATE_STATE':
      // Only update if version is newer to prevent conflicts
      if (action.payload.version > state.version) {
        return {
          ...state,
          ...action.payload,
          lastUpdate: Date.now()
        }
      }
      return state
    
    case 'START_QUIZ':
      return {
        ...state,
        status: 'active',
        currentQuestion: 0,
        timeLeft: state.timePerQuestion
      }
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload.questionIndex,
        timeLeft: state.timePerQuestion,
        version: state.version + 1
      }
    
    case 'UPDATE_TIMER':
      return {
        ...state,
        timeLeft: Math.max(0, action.payload.timeLeft),
        version: state.version + 1
      }
    
    case 'SUBMIT_ANSWER':
      const { participantId, questionIndex, answer } = action.payload
      return {
        ...state,
        participants: {
          ...state.participants,
          [participantId]: {
            ...state.participants[participantId],
            answers: {
              ...state.participants[participantId]?.answers,
              [questionIndex]: {
                answer,
                timestamp: Date.now()
              }
            }
          }
        },
        version: state.version + 1
      }
    
    case 'UPDATE_SCORE':
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.payload.participantId]: {
            ...state.participants[action.payload.participantId],
            score: action.payload.score
          }
        },
        version: state.version + 1
      }
    
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        status: 'completed'
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.error
      }
    
    case 'RESET':
      return initialState
    
    default:
      return state
  }
}

export function QuizStateProvider({ children }) {
  const [state, dispatch] = useReducer(quizStateReducer, initialState)

  const actions = {
    setSession: (sessionId) => {
      dispatch({ type: 'SET_SESSION', payload: { sessionId } })
    },
    
    updateState: (newState) => {
      dispatch({ type: 'UPDATE_STATE', payload: newState })
    },
    
    startQuiz: () => {
      dispatch({ type: 'START_QUIZ' })
    },
    
    nextQuestion: (questionIndex) => {
      dispatch({ type: 'NEXT_QUESTION', payload: { questionIndex } })
    },
    
    updateTimer: (timeLeft) => {
      dispatch({ type: 'UPDATE_TIMER', payload: { timeLeft } })
    },
    
    submitAnswer: (participantId, questionIndex, answer) => {
      dispatch({ 
        type: 'SUBMIT_ANSWER', 
        payload: { participantId, questionIndex, answer } 
      })
    },
    
    updateScore: (participantId, score) => {
      dispatch({ 
        type: 'UPDATE_SCORE', 
        payload: { participantId, score } 
      })
    },
    
    completeQuiz: () => {
      dispatch({ type: 'COMPLETE_QUIZ' })
    },
    
    setError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: { error } })
    },
    
    reset: () => {
      dispatch({ type: 'RESET' })
    }
  }

  return (
    <QuizStateContext.Provider value={{ state, actions }}>
      {children}
    </QuizStateContext.Provider>
  )
}

export function useQuizState() {
  const context = useContext(QuizStateContext)
  if (!context) {
    throw new Error('useQuizState must be used within a QuizStateProvider')
  }
  return context
}