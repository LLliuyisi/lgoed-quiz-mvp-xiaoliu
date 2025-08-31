import React, { useState, useEffect } from 'react'
import { HostControls } from '../components'
import { liveQuizService } from '../services/liveQuizService'

const Host = () => {
  const [questions, setQuestions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState('')
  const [sessionExists, setSessionExists] = useState(false)
  const [loadingError, setLoadingError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hostId, setHostId] = useState('')

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

  const handleHostAuth = (inputHostId) => {
    if (inputHostId.trim()) {
      setHostId(inputHostId.trim())
      setIsAuthenticated(true)
    }
  }

  const handleCreateSession = async () => {
    try {
      const result = await liveQuizService.createQuizSession(hostId, {
        questions: questions.slice(0, 10), // Use first 10 questions
        timePerQuestion: 30 // 30 seconds per question
      })
      
      if (result.success) {
        setCurrentSessionId(result.sessionId)
        setSessionExists(true)
      } else {
        setLoadingError(`Failed to create session: ${result.error}`)
      }
    } catch (error) {
      setLoadingError(`Error creating session: ${error.message}`)
    }
  }

  const handleJoinExistingSession = async (sessionId) => {
    try {
      const result = await liveQuizService.getQuizSession(sessionId)
      
      if (result.success) {
        setCurrentSessionId(sessionId)
        setSessionExists(true)
      } else {
        setLoadingError(`Session not found: ${result.error}`)
      }
    } catch (error) {
      setLoadingError(`Error joining session: ${error.message}`)
    }
  }

  const handleHostAction = (action, result) => {
    console.log(`Host action: ${action}`, result)
    
    // Handle specific actions
    if (action === 'reset') {
      // Session has been reset, stay on the same session
    } else if (action === 'stop') {
      // Quiz stopped, could optionally redirect or show completion
    }
  }

  const handleBackToSetup = () => {
    setCurrentSessionId('')
    setSessionExists(false)
    setLoadingError('')
  }

  if (loadingError) {
    return (
      <div className="page error-page">
        <div className="error-state">
          <h1>⚠️ Error</h1>
          <div className="error-details">
            <p>{loadingError}</p>
          </div>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => setLoadingError('')}>
              Try Again
            </button>
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <div className="host-auth">
          <h1>Quiz Host Panel</h1>
          <p>Enter your host ID to access quiz controls</p>
          
          <div className="auth-form">
            <input
              type="text"
              placeholder="Enter Host ID (e.g., teacher_smith, host_demo)"
              className="host-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleHostAuth(e.target.value)
                }
              }}
            />
            <button 
              className="btn-primary"
              onClick={(e) => {
                const input = e.target.previousElementSibling
                handleHostAuth(input.value)
              }}
            >
              Access Host Panel
            </button>
          </div>
          
          <div className="auth-info">
            <h3>Host Authentication</h3>
            <ul>
              <li>Enter any unique host identifier</li>
              <li>Use "host_demo" for demonstration purposes</li>
              <li>This will be your identity for managing quiz sessions</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (sessionExists && currentSessionId) {
    return (
      <div className="page">
        <div className="host-panel">
          <div className="panel-header">
            <button className="btn-outline" onClick={handleBackToSetup}>
              ← Back to Setup
            </button>
            <div className="host-info">
              <span>Host: {hostId}</span>
            </div>
          </div>
          
          <HostControls 
            sessionId={currentSessionId} 
            onHostAction={handleHostAction}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="host-setup">
        <h1>Create or Join Quiz Session</h1>
        <p>Welcome, <strong>{hostId}</strong>! Set up your quiz session below.</p>
        
        <div className="setup-options">
          <div className="setup-card">
            <h3>Create New Session</h3>
            <p>Start a new live quiz with {questions.length} questions</p>
            <div className="session-config">
              <div className="config-item">
                <span>Questions: 10 (first 10 from database)</span>
              </div>
              <div className="config-item">
                <span>Time per question: 30 seconds</span>
              </div>
            </div>
            <button 
              className="btn-primary btn-large"
              onClick={handleCreateSession}
              disabled={questions.length === 0}
            >
              {questions.length === 0 ? 'Loading Questions...' : '🚀 Create New Session'}
            </button>
          </div>
          
          <div className="setup-card">
            <h3>Join Existing Session</h3>
            <p>Take control of an existing quiz session</p>
            <div className="join-form">
              <input
                type="text"
                placeholder="Enter Session ID"
                className="session-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinExistingSession(e.target.value.trim())
                  }
                }}
              />
              <button 
                className="btn-secondary"
                onClick={(e) => {
                  const input = e.target.previousElementSibling
                  handleJoinExistingSession(input.value.trim())
                }}
              >
                Join Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Host