import { useState, useCallback } from 'react'
import { QUIZ_CONFIG } from '../utils/constants'

export const useQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUIZ_CONFIG.DEFAULT_TIME_LIMIT)
  const [isActive, setIsActive] = useState(false)
  const [answers, setAnswers] = useState([])
  const [isComplete, setIsComplete] = useState(false)

  const startQuiz = useCallback(() => {
    setIsActive(true)
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(QUIZ_CONFIG.DEFAULT_TIME_LIMIT)
    setAnswers([])
    setIsComplete(false)
  }, [])

  const nextQuestion = useCallback(() => {
    if (currentQuestion < answers.length) {
      setCurrentQuestion(prev => prev + 1)
    }
  }, [currentQuestion, answers.length])

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }, [currentQuestion])

  const submitAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[questionId] = answer
      return newAnswers
    })
  }, [])

  const finishQuiz = useCallback(() => {
    setIsActive(false)
    setIsComplete(true)
  }, [])

  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(QUIZ_CONFIG.DEFAULT_TIME_LIMIT)
    setIsActive(false)
    setAnswers([])
    setIsComplete(false)
  }, [])

  const calculateScore = useCallback(() => {
    // This would be implemented based on your scoring logic
    return score
  }, [score])

  return {
    currentQuestion,
    score,
    timeLeft,
    isActive,
    answers,
    isComplete,
    startQuiz,
    nextQuestion,
    previousQuestion,
    submitAnswer,
    finishQuiz,
    resetQuiz,
    calculateScore
  }
}
