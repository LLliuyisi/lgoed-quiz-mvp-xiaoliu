import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="page">
      <h1>Welcome to AlgoEd Quiz MVP</h1>
      <p>Your platform for algorithm education and quizzes</p>
      <div className="features">
        <Link to="/learn" className="feature-card-link">
          <div className="feature-card">
            <h3>📚 Learn</h3>
            <p>Master algorithms and data structures with interactive lessons</p>
          </div>
        </Link>
        <Link to="/quiz" className="feature-card-link">
          <div className="feature-card">
            <h3>🧪 Quiz</h3>
            <p>Test your knowledge with challenging quizzes</p>
          </div>
        </Link>
        <Link to="/profile" className="feature-card-link">
          <div className="feature-card">
            <h3>📊 Track Progress</h3>
            <p>Monitor your learning journey and achievements</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Home
