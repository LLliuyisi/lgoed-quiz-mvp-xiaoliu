import React from 'react'

const Learn = () => {
  return (
    <div className="page">
      <h1>Learn</h1>
      <p>Learn algorithms and data structures</p>
      <div className="learning-modules">
        <div className="module-card">
          <h3>Module 1: Introduction to Algorithms</h3>
          <p>Learn the basics of algorithm design and analysis</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: '0%' }}></div>
          </div>
          <button className="btn-secondary">Start Learning</button>
        </div>
        <div className="module-card">
          <h3>Module 2: Data Structures Fundamentals</h3>
          <p>Master arrays, linked lists, and basic data structures</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: '0%' }}></div>
          </div>
          <button className="btn-secondary">Start Learning</button>
        </div>
        <div className="module-card">
          <h3>Module 3: Advanced Algorithms</h3>
          <p>Explore dynamic programming and graph algorithms</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: '0%' }}></div>
          </div>
          <button className="btn-secondary">Start Learning</button>
        </div>
      </div>
    </div>
  )
}

export default Learn
