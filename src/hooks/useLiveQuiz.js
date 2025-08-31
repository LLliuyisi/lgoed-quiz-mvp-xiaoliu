import { useState, useEffect, useRef } from 'react'
import { liveQuizService } from '../services/liveQuizService'

export const useLiveQuiz = (sessionId, participantId, participantName) => {
  const [quizState, setQuizState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastKnownState, setLastKnownState] = useState(null)
  const unsubscribeRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  useEffect(() => {
    if (!sessionId || !participantId || !participantName) {
      setLoading(false)
      return
    }

    // Join the quiz session
    const joinSession = async () => {
      setLoading(true)
      const result = await liveQuizService.joinQuizSession(sessionId, participantId, participantName)
      
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Set up real-time listener
      const unsubscribe = liveQuizService.subscribeToQuizSession(sessionId, (update) => {
        if (update.success) {
          setQuizState(update.data)
          setLastKnownState(update.data)
          setConnected(true)
          setError('')
          
          // Clear any pending reconnection attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        } else {
          setError(update.error)
          setConnected(false)
          
          // Attempt to reconnect after 3 seconds
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              joinSession()
            }, 3000)
          }
        }
        setLoading(false)
      })

      unsubscribeRef.current = unsubscribe
    }

    joinSession()

    // Cleanup listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [sessionId, participantId, participantName])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (!connected && sessionId) {
        // Attempt to reconnect when coming back online
        setError('')
        setLoading(true)
        // Trigger rejoin
        window.location.reload()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnected(false)
      setError('Connection lost. Please check your internet connection.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [connected, sessionId])

  const submitAnswer = async (questionIndex, answer) => {
    if (!sessionId || !participantId) return { success: false, error: 'Session not initialized' }
    
    // Check if we're still connected and on the same question
    if (!connected) {
      return { success: false, error: 'Not connected to quiz session' }
    }
    
    if (quizState && questionIndex !== quizState.currentQuestion) {
      return { success: false, error: 'Question has already changed' }
    }
    
    // Check if answer was already submitted for this question
    const participantData = getParticipantData()
    if (participantData?.answers && participantData.answers[questionIndex]) {
      return { success: false, error: 'Answer already submitted for this question' }
    }
    
    const result = await liveQuizService.submitAnswer(sessionId, participantId, questionIndex, answer)
    
    if (result.success) {
      // Update local score if answer is correct
      const currentQuestion = quizState?.questions[questionIndex]
      if (currentQuestion && answer === currentQuestion.correctAnswer) {
        const currentParticipant = quizState?.participants[participantId]
        const newScore = (currentParticipant?.score || 0) + 1
        await liveQuizService.updateScore(sessionId, participantId, newScore)
      }
    }
    
    return result
  }

  const getCurrentQuestion = () => {
    if (!quizState || !quizState.questions) return null
    return quizState.questions[quizState.currentQuestion]
  }

  const getParticipantData = () => {
    if (!quizState || !participantId) return null
    return quizState.participants[participantId]
  }

  const isQuizActive = () => {
    return quizState?.status === 'active'
  }

  const isQuizCompleted = () => {
    return quizState?.status === 'completed'
  }

  return {
    quizState,
    loading,
    error,
    connected,
    isOnline,
    lastKnownState,
    submitAnswer,
    getCurrentQuestion,
    getParticipantData,
    isQuizActive,
    isQuizCompleted
  }
}