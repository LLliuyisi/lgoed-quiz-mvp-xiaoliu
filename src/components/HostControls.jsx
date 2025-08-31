import React, { useState, useEffect } from 'react'
import { liveQuizService } from '../services/liveQuizService'

const HostControls = ({ sessionId, onHostAction }) => {
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) return

    const unsubscribe = liveQuizService.subscribeToQuizSession(sessionId, (result) => {
      if (result.success) {
        setSessionData(result.data)
      } else {
        setError(result.error)
      }
    })

    return unsubscribe
  }, [sessionId])

  const handleHostAction = async (action, actionName) => {
    try {
      setLoading(true)
      setError('')
      
      const result = await action()
      
      if (result.success) {
        onHostAction && onHostAction(actionName, result)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    handleHostAction(() => liveQuizService.startQuiz(sessionId), 'start')
  }

  const handlePause = () => {
    handleHostAction(() => liveQuizService.pauseQuiz(sessionId), 'pause')
  }

  const handleResume = () => {
    handleHostAction(() => liveQuizService.resumeQuiz(sessionId), 'resume')
  }

  const handleStop = () => {
    if (window.confirm('Are you sure you want to stop the quiz? This cannot be undone.')) {
      handleHostAction(() => liveQuizService.stopQuiz(sessionId), 'stop')
    }
  }

  const handleNextQuestion = () => {
    handleHostAction(() => liveQuizService.forceNextQuestion(sessionId), 'nextQuestion')
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the quiz? All participant data will be lost.')) {
      handleHostAction(() => liveQuizService.resetQuiz(sessionId), 'reset')
    }
  }

  if (!sessionData) {
    return (
      <div className="host-controls">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading quiz session...</p>
        </div>
      </div>
    )
  }

  const { status, currentQuestion, totalQuestions, timeLeft, participants } = sessionData
  const participantCount = Object.keys(participants || {}).length

  return (
    <div className="host-controls">
      <div className="control-header">
        <h2>Quiz Host Controls</h2>
        <div className="session-info">
          <span className="session-id">Session: {sessionId}</span>
          <span className={`status-badge ${status}`}>{status.toUpperCase()}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="quiz-overview">
        <div className="overview-stats">
          <div className="stat-item">
            <span className="stat-label">Question:</span>
            <span className="stat-value">{currentQuestion + 1} / {totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Left:</span>
            <span className="stat-value">{Math.max(0, timeLeft)}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Participants:</span>
            <span className="stat-value">{participantCount}</span>
          </div>
        </div>
      </div>

      <div className="control-actions">
        <div className="primary-controls">
          {status === 'waiting' && (
            <button 
              className="btn-primary btn-large" 
              onClick={handleStart}
              disabled={loading || participantCount === 0}
            >
              🚀 Start Quiz
            </button>
          )}

          {status === 'active' && (
            <>
              <button 
                className="btn-secondary btn-medium" 
                onClick={handlePause}
                disabled={loading}
              >
                ⏸ Pause
              </button>
              <button 
                className="btn-primary btn-medium" 
                onClick={handleNextQuestion}
                disabled={loading || currentQuestion >= totalQuestions - 1}
              >
                ⏭ Next Question
              </button>
            </>
          )}

          {status === 'paused' && (
            <button 
              className="btn-primary btn-large" 
              onClick={handleResume}
              disabled={loading}
            >
              ▶️ Resume Quiz
            </button>
          )}

          {(status === 'completed' || status === 'stopped') && (
            <button 
              className="btn-primary btn-large" 
              onClick={handleReset}
              disabled={loading}
            >
              🔄 Reset Quiz
            </button>
          )}
        </div>

        <div className="secondary-controls">
          {(status === 'active' || status === 'paused') && (
            <button 
              className="btn-danger btn-medium" 
              onClick={handleStop}
              disabled={loading}
            >
              🛑 Stop Quiz
            </button>
          )}
        </div>
      </div>

      <div className="monitoring-dashboard">
        <h3>📊 Real-Time Monitoring</h3>
        
        {participantCount === 0 ? (
          <div className="no-participants">
            <p>Waiting for participants to join...</p>
            <div className="session-invite">
              <p><strong>Share Session ID:</strong> <code>{sessionId}</code></p>
              <p>Participants can join by entering this ID</p>
            </div>
          </div>
        ) : (
          <>
            <div className="quiz-statistics">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-data">
                    <span className="stat-number">{participantCount}</span>
                    <span className="stat-label">Active Participants</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-data">
                    <span className="stat-number">
                      {Math.round((Object.values(participants).reduce((sum, p) => sum + (p.score || 0), 0) / participantCount) * 100) / 100}
                    </span>
                    <span className="stat-label">Average Score</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-data">
                    <span className="stat-number">
                      {Object.values(participants).filter(p => 
                        p.answers && Object.keys(p.answers).length > currentQuestion
                      ).length}
                    </span>
                    <span className="stat-label">Answered Current</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-data">
                    <span className="stat-number">
                      {participantCount > 0 ? Math.round((Object.values(participants).filter(p => 
                        p.answers && Object.keys(p.answers).length > currentQuestion
                      ).length / participantCount) * 100) : 0}%
                    </span>
                    <span className="stat-label">Response Rate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="participants-monitoring">
              <h4>Participant Details</h4>
              <div className="participants-table">
                <div className="table-header">
                  <span>Participant</span>
                  <span>Score</span>
                  <span>Progress</span>
                  <span>Current Question</span>
                  <span>Status</span>
                </div>
                {Object.values(participants).map((participant, index) => {
                  const answeredQuestions = participant.answers ? Object.keys(participant.answers).length : 0
                  const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100)
                  const hasAnsweredCurrent = participant.answers && participant.answers[currentQuestion]
                  
                  return (
                    <div key={participant.id} className="table-row">
                      <div className="participant-info">
                        <div className="participant-avatar">
                          {(participant.name || `Player ${index + 1}`)[0].toUpperCase()}
                        </div>
                        <span className="participant-name">
                          {participant.name || `Player ${index + 1}`}
                        </span>
                      </div>
                      <div className="participant-score">{participant.score || 0}/{totalQuestions}</div>
                      <div className="participant-progress">
                        <div className="mini-progress-bar">
                          <div 
                            className="mini-progress-fill" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{progressPercent}%</span>
                      </div>
                      <div className="current-status">
                        {answeredQuestions > currentQuestion ? (
                          <span className="status-ahead">Ahead</span>
                        ) : answeredQuestions === currentQuestion + 1 ? (
                          <span className="status-current">Current</span>
                        ) : (
                          <span className="status-behind">Behind</span>
                        )}
                      </div>
                      <div className="answer-status">
                        {hasAnsweredCurrent ? (
                          <span className="answered">✅ Answered</span>
                        ) : status === 'active' ? (
                          <span className="pending">⏳ Answering</span>
                        ) : (
                          <span className="waiting">⏸ Waiting</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {status === 'active' && (
              <div className="live-activity">
                <h4>Live Activity</h4>
                <div className="activity-feed">
                  {Object.values(participants).map((participant, index) => {
                    const hasAnsweredCurrent = participant.answers && participant.answers[currentQuestion]
                    return (
                      <div key={participant.id} className={`activity-item ${hasAnsweredCurrent ? 'answered' : 'pending'}`}>
                        <span className="activity-icon">
                          {hasAnsweredCurrent ? '✅' : '⏳'}
                        </span>
                        <span className="activity-text">
                          {participant.name || `Player ${index + 1}`} - 
                          {hasAnsweredCurrent ? ' Submitted answer' : ' Still answering'}
                        </span>
                        <span className="activity-time">
                          {hasAnsweredCurrent ? 
                            `${Math.max(0, timeLeft)}s remaining` : 
                            `${Math.max(0, timeLeft)}s left`
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HostControls