import React, { useState, useEffect, useRef } from 'react'

const QuizQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  score, 
  onAnswerSubmit, 
  onExitQuiz,
  timeLimit = 5,
  isLiveMode = false,
  externalTimeLeft = null
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showNextButton, setShowNextButton] = useState(false)
  const hasTimeExpired = useRef(false)

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setShowFeedback(false)
    setErrorMessage('')
    setShowNextButton(false)
    setTimeLeft(timeLimit)
    hasTimeExpired.current = false
  }, [question, timeLimit])

  useEffect(() => {
    // Use external timer for live mode, internal timer for solo mode
    if (isLiveMode && externalTimeLeft !== null) {
      setTimeLeft(externalTimeLeft)
      if (externalTimeLeft <= 0 && !hasTimeExpired.current && !isSubmitted) {
        hasTimeExpired.current = true
        setIsSubmitted(true)
        setShowFeedback(true)
        setShowNextButton(true)
      }
      return
    }

    // Solo mode timer
    if (!isLiveMode) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            if (!hasTimeExpired.current && !isSubmitted) {
              hasTimeExpired.current = true
              setIsSubmitted(true)
              setShowFeedback(true)
              setShowNextButton(true)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [question, selectedAnswer, isSubmitted, onAnswerSubmit, isLiveMode, externalTimeLeft])

  const handleAnswerSelect = (index) => {
    if (!isSubmitted) {
      setSelectedAnswer(index)
    }
  }

  const handleSubmit = () => {
    // Strict submission window control
    if (timeLeft <= 0) {
      setErrorMessage('⏰ Submission window closed - Time is up!')
      return
    }
    
    if (isSubmitted) {
      setErrorMessage('❌ Submission already recorded for this question.')
      return
    }
    
    if (selectedAnswer === null) {
      setErrorMessage('⚠️ Please select an answer before submitting.')
      return
    }
    
    // Final validation: double-check timer hasn't expired during submission
    if (timeLeft > 0) {
      setErrorMessage('')
      setIsSubmitted(true)
      setShowFeedback(true)
      setShowNextButton(true)
      setTimeLeft(0) // Set timer to 0 immediately when user submits
    } else {
      setErrorMessage('⏰ Submission rejected - Timer expired during submission attempt.')
    }
  }

  const handleReset = () => {
    if (!isSubmitted) {
      setSelectedAnswer(null)
      setErrorMessage('')
    }
  }

  const handleNext = () => {
    onAnswerSubmit(selectedAnswer !== null ? selectedAnswer : null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!question) return null

  return (
    <div className="quiz-question">
      <div className="quiz-header">
        <div className="quiz-title">
          <h1>Dartmouth Philosophy Society Quiz Competition</h1>
        </div>
        <div className="quiz-stats">
          <div className="current-score">
            Current Score: <span className="score-value">{score}/{totalQuestions}</span>
          </div>
          <div className={`timer ${timeLeft <= 10 ? 'timer-warning' : ''} ${timeLeft <= 5 ? 'timer-critical' : ''}`}>
            <span className="timer-icon">⏱</span>
            <span className="timer-value">{formatTime(timeLeft)}</span>
            {timeLeft <= 5 && timeLeft > 0 && (
              <span className="submission-warning">Closing Soon!</span>
            )}
            {timeLeft <= 0 && (
              <span className="submission-closed">Closed</span>
            )}
          </div>
          <button className="exit-quiz" onClick={onExitQuiz}>Exit Quiz</button>
        </div>
      </div>

      <div className="question-content">
        <div className="question-progress">
          <div className="progress-text">Question {questionNumber} of {totalQuestions}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="question-text">
          <h2>{question.question}</h2>
        </div>

        <div className="answer-options">
          {question.options.map((option, index) => {
            let optionClass = 'answer-option'
            if (selectedAnswer === index) optionClass += ' selected'
            if (isSubmitted) optionClass += ' disabled'
            if (showFeedback && isSubmitted) {
              if (index === question.correctAnswer) {
                optionClass += ' correct'
              } else if (selectedAnswer === index && index !== question.correctAnswer) {
                optionClass += ' incorrect'
              }
            }

            return (
              <button
                key={index}
                className={optionClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={isSubmitted}
              >
                <div className="option-radio">
                  <div className={`radio-button ${selectedAnswer === index ? 'selected' : ''}`}>
                    {selectedAnswer === index && <div className="radio-dot"></div>}
                  </div>
                </div>
                <span className="option-text">{option}</span>
                {showFeedback && isSubmitted && index === question.correctAnswer && (
                  <span className="feedback-icon correct-icon">✓</span>
                )}
                {showFeedback && isSubmitted && selectedAnswer === index && index !== question.correctAnswer && (
                  <span className="feedback-icon incorrect-icon">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {showFeedback && isSubmitted && (
          <div className="feedback-message">
            <div className={`feedback-result ${selectedAnswer === question.correctAnswer ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === question.correctAnswer ? (
                <>
                  <span className="feedback-icon correct-icon">✓</span>
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <span className="feedback-icon incorrect-icon">✗</span>
                  <span>Incorrect. The correct answer is: {question.options[question.correctAnswer]}</span>
                </>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errorMessage}</span>
            <div className="error-guidance">
              {errorMessage.includes('select an answer') && 'Choose one of the options above to continue.'}
              {errorMessage.includes('Time is up') && 'The question has moved to the next one automatically.'}
              {errorMessage.includes('already submitted') && 'Wait for the next question to appear.'}
            </div>
          </div>
        )}

        <div className="quiz-actions">
          <button className="reset-button" onClick={handleReset} disabled={isSubmitted || timeLeft <= 0}>
            Reset response
          </button>
          
          {!showNextButton ? (
            <button 
              className={`submit-button ${timeLeft <= 0 ? 'window-closed' : ''} ${timeLeft <= 5 && timeLeft > 0 ? 'window-closing' : ''}`}
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isSubmitted || timeLeft <= 0}
            >
              {timeLeft <= 0 ? 'Submit' : 
               timeLeft <= 5 ? `⚡ Submit Now (${timeLeft}s)` : 'Submit Answer'}
            </button>
          ) : (
            <button 
              className="next-button"
              onClick={handleNext}
            >
              {questionNumber === totalQuestions ? '🏁 Finish Quiz' : 'Next Question →'}
            </button>
          )}
        </div>

        {timeLeft <= 0 && !isSubmitted && (
          <div className="submission-window-closed">
            <span className="window-icon">🔒</span>
            <span>Submission window has closed for this question</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizQuestion