import React, { useState, useEffect } from 'react'
import { QuizQuestion, LiveQuiz } from '../components'
import { liveQuizService } from '../services/liveQuizService'
import { createAnswerRandomizer, generateUserSessionId, generateQuizSessionId } from '../utils/answerRandomizer'

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [loadingError, setLoadingError] = useState('')
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [liveSessionId, setLiveSessionId] = useState('')
  const [randomizedQuestions, setRandomizedQuestions] = useState([])
  const [userSessionId] = useState(() => generateUserSessionId())
  const [quizSessionId, setQuizSessionId] = useState(null)

  useEffect(() => {
    loadPhilosophyQuestions()
  }, [])

  const loadPhilosophyQuestions = async () => {
    try {
      setLoadingError('')
      const response = await fetch('/philosophy_questions.json')
      
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No questions found in the data file')
      }
      
      const formattedQuestions = data.map((q, index) => {
        if (!q.question || !q.choices || !Array.isArray(q.choices) || !q.answer) {
          throw new Error(`Invalid question format at index ${index}`)
        }
        
        return {
          id: index + 1,
          question: q.question,
          options: q.choices,
          correctAnswer: q.choices.indexOf(q.answer)
        }
      })
      
      setQuestions(formattedQuestions)
    } catch (error) {
      console.error('Failed to load questions:', error)
      setLoadingError(`Error loading quiz: ${error.message}`)
    }
  }

  const handleStartQuiz = () => {
    // Generate new quiz session ID for new randomization
    const newQuizSessionId = generateQuizSessionId()
    setQuizSessionId(newQuizSessionId)
    
    // Create randomized questions for this session
    const randomizer = createAnswerRandomizer(userSessionId, newQuizSessionId)
    const randomized = randomizer.randomizeQuiz(questions)
    setRandomizedQuestions(randomized)
    
    setQuizStarted(true)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setScore(0)
    setUserAnswers([])
  }

  const handleStartLiveQuiz = async () => {
    try {
      const result = await liveQuizService.createQuizSession('host_demo', {
        questions: questions.slice(0, 5), // Use first 5 questions for demo
        timePerQuestion: 15 // Shorter time for live demo
      })
      
      if (result.success) {
        setLiveSessionId(result.sessionId)
        setIsLiveMode(true)
        // Auto-start the live quiz for demo
        setTimeout(() => {
          liveQuizService.startQuiz(result.sessionId)
        }, 2000)
      } else {
        console.error('Failed to create live quiz:', result.error)
        alert('Failed to start live quiz. Please check Firebase configuration.')
      }
    } catch (error) {
      console.error('Live quiz error:', error)
      // Fallback to demo mode without Firebase
      const newQuizSessionId = generateQuizSessionId()
      setQuizSessionId(newQuizSessionId)
      
      // Create randomized questions for live demo
      const randomizer = createAnswerRandomizer(userSessionId, newQuizSessionId)
      const randomized = randomizer.randomizeQuiz(questions)
      setRandomizedQuestions(randomized)
      
      setIsLiveMode(true)
      setLiveSessionId('demo_session')
    }
  }

  const handleExitLiveQuiz = () => {
    setIsLiveMode(false)
    setLiveSessionId('')
  }

  const handleAnswerSubmit = (selectedAnswerIndex) => {
    const currentQuestion = isLiveMode ? 
      randomizedQuestions.slice(0, 5)[currentQuestionIndex] : 
      randomizedQuestions[currentQuestionIndex]
    const isCorrect = selectedAnswerIndex !== null && selectedAnswerIndex === currentQuestion.correctAnswer
    
    setUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswerIndex,
      isCorrect
    }])

    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // No delay here - the component handles its own timing
    const totalQuestions = isLiveMode ? 5 : randomizedQuestions.length
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setQuizStarted(false)
      setQuizCompleted(true)
    }
  }


  const handleExitQuiz = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setScore(0)
    setUserAnswers([])
    setQuizSessionId(null)
    setRandomizedQuestions([])
  }

  if (quizCompleted) {
    const totalQuestions = isLiveMode ? 5 : randomizedQuestions.length
    const percentage = Math.round((score / totalQuestions) * 100)
    const passed = percentage >= 70

    return (
      <div className="page quiz-completion">
        <div className="completion-header">
          <h1>Quiz Completed!</h1>
          <div className="completion-score">
            <div className={`final-score ${passed ? 'passed' : 'failed'}`}>
              {score}/{totalQuestions}
            </div>
            <div className="score-percentage">{percentage}%</div>
            <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
              {passed ? '🎉 Passed!' : '📚 Keep Learning!'}
            </div>
          </div>
        </div>
        <div className="completion-actions">
          <button className="btn-primary" onClick={handleStartQuiz}>
            Take Quiz Again (New Randomization)
          </button>
          <button className="btn-secondary" onClick={handleExitQuiz}>
            Back to Categories
          </button>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="page error-page">
        <div className="error-state">
          <h1>⚠️ Error Loading Quiz</h1>
          <div className="error-details">
            <p>{loadingError}</p>
          </div>
          <div className="error-actions">
            <button className="btn-primary" onClick={loadPhilosophyQuestions}>
              Try Again
            </button>
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
          <div className="error-guidance">
            <h3>What you can do:</h3>
            <ul>
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (isLiveMode) {
    // For now, use enhanced solo mode as live demo with only 5 questions
    const liveQuestions = randomizedQuestions.slice(0, 5)
    const currentQuestion = liveQuestions[currentQuestionIndex]
    
    // Check if live quiz is completed
    if (currentQuestionIndex >= 5) {
      const percentage = Math.round((score / 5) * 100)
      const passed = percentage >= 70

      return (
        <div className="page quiz-completion">
          <div className="completion-header">
            <h1>🔴 Live Quiz Completed!</h1>
            <div className="completion-score">
              <div className={`final-score ${passed ? 'passed' : 'failed'}`}>
                {score}/5
              </div>
              <div className="score-percentage">{percentage}%</div>
              <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
                {passed ? '🎉 Passed!' : '📚 Keep Learning!'}
              </div>
            </div>
          </div>
          <div className="completion-actions">
            <button className="btn-primary" onClick={handleExitLiveQuiz}>
              Back to Quiz Selection
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <div className="live-quiz">
        <div className="connection-status">
          <span className="status-dot connected"></span>
          <span>Live Demo Mode</span>
        </div>
        
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={5}
          score={score}
          onAnswerSubmit={handleAnswerSubmit}
          onExitQuiz={handleExitLiveQuiz}
          timeLimit={15}
          isLiveMode={true}
        />
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="page">
        <h1>Philosophy Quiz</h1>
        <p>Test your knowledge of philosophy</p>
        <div className="quiz-categories">
          <div className="category-card">
            <h3>Solo Quiz</h3>
            <p>{questions.length} questions about philosophical concepts and thinkers</p>
            <p className="randomization-notice">🔀 Answer options will be randomized for anti-cheat protection</p>
            <button 
              className="btn-primary" 
              onClick={handleStartQuiz}
              disabled={questions.length === 0}
            >
              {questions.length === 0 ? 'Loading...' : 'Start Solo Quiz'}
            </button>
          </div>
          <div className="category-card">
            <h3>🔴 Live Quiz</h3>
            <p>Real-time synchronized quiz with live updates (5 questions demo)</p>
            <p className="randomization-notice">🔀 Answer options randomized per session</p>
            <button 
              className="btn-secondary" 
              onClick={handleStartLiveQuiz}
              disabled={questions.length === 0}
            >
              {questions.length === 0 ? 'Loading...' : 'Start Live Quiz'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (randomizedQuestions.length === 0) {
    return (
      <div className="page">
        <div className="loading-state">
          <h2>Loading questions...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  const currentQuestion = randomizedQuestions[currentQuestionIndex]

  return (
    <QuizQuestion
      question={currentQuestion}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={randomizedQuestions.length}
      score={score}
      onAnswerSubmit={handleAnswerSubmit}
      onExitQuiz={handleExitQuiz}
    />
  )
}

export default Quiz
