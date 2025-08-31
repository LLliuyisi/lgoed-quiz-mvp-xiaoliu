import React, { useState, useEffect } from 'react'
import { useLiveQuiz } from '../hooks/useLiveQuiz'
import QuizQuestion from './QuizQuestion'

const LiveQuiz = ({ sessionId, onExit }) => {
  const [participantId] = useState(() => `participant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`)
  const [participantName] = useState(() => `User_${Math.floor(Math.random() * 1000)}`)
  
  const {
    quizState,
    loading,
    error,
    connected,
    submitAnswer,
    getCurrentQuestion,
    getParticipantData,
    isQuizActive,
    isQuizCompleted
  } = useLiveQuiz(sessionId, participantId, participantName)

  // Demo mode fallback when sessionId is 'demo_session'
  const isDemoMode = sessionId === 'demo_session'

  const handleAnswerSubmit = async (selectedAnswerIndex) => {
    if (!quizState) return
    
    const result = await submitAnswer(quizState.currentQuestion, selectedAnswerIndex)
    if (!result.success) {
      console.error('Failed to submit answer:', result.error)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <h2>Connecting to live quiz...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page error-page">
        <div className="error-state">
          <h1>⚠️ Connection Error</h1>
          <div className="error-details">
            <p>{error}</p>
          </div>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reconnect
            </button>
            <button className="btn-secondary" onClick={onExit}>
              Exit Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="page">
        <div className="connection-state">
          <h2>⚡ Reconnecting...</h2>
          <p>Trying to reconnect to the live quiz session</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (quizState?.status === 'waiting') {
    return (
      <div className="page">
        <div className="waiting-state">
          <h1>🎯 Live Quiz Session</h1>
          <h2>Waiting for quiz to start...</h2>
          <p>Connected as: <strong>{participantName}</strong></p>
          <p>Participants joined: <strong>{Object.keys(quizState.participants || {}).length}</strong></p>
          <div className="connection-indicator">
            <span className="status-dot connected"></span>
            <span>Connected to live session</span>
          </div>
        </div>
      </div>
    )
  }

  if (isQuizCompleted()) {
    const participantData = getParticipantData()
    const finalScore = participantData?.score || 0
    const totalQuestions = quizState?.totalQuestions || 0
    const percentage = Math.round((finalScore / totalQuestions) * 100)

    return (
      <div className="page quiz-completion">
        <div className="completion-header">
          <h1>🎉 Live Quiz Completed!</h1>
          <div className="completion-score">
            <div className={`final-score ${percentage >= 70 ? 'passed' : 'failed'}`}>
              {finalScore}/{totalQuestions}
            </div>
            <div className="score-percentage">{percentage}%</div>
          </div>
        </div>
        <div className="completion-actions">
          <button className="btn-primary" onClick={onExit}>
            Back to Quiz Selection
          </button>
        </div>
      </div>
    )
  }

  if (!isQuizActive()) {
    return (
      <div className="page">
        <div className="quiz-inactive">
          <h2>Quiz session is not active</h2>
          <button className="btn-secondary" onClick={onExit}>
            Back to Quiz Selection
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  const participantData = getParticipantData()

  if (!currentQuestion) {
    return (
      <div className="page">
        <div className="loading-state">
          <h2>Loading question...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="live-quiz">
      <div className="connection-status">
        <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
        <span>{connected ? 'Live' : 'Reconnecting...'}</span>
      </div>
      
      <QuizQuestion
        question={currentQuestion}
        questionNumber={quizState.currentQuestion + 1}
        totalQuestions={quizState.totalQuestions}
        score={participantData?.score || 0}
        onAnswerSubmit={handleAnswerSubmit}
        onExitQuiz={onExit}
        timeLimit={quizState.timePerQuestion}
        isLiveMode={true}
        externalTimeLeft={quizState.timeLeft}
      />
    </div>
  )
}

export default LiveQuiz