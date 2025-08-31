import React from 'react'

const Profile = () => {
  return (
    <div className="page">
      <h1>Profile</h1>
      <p>View your progress and achievements</p>
      <div className="profile-content">
        <div className="profile-stats">
          <div className="stat-card">
            <h3>Quizzes Completed</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <p className="stat-number">0%</p>
          </div>
          <div className="stat-card">
            <h3>Learning Hours</h3>
            <p className="stat-number">0h</p>
          </div>
        </div>
        <div className="achievements">
          <h3>Achievements</h3>
          <p>Complete quizzes and learning modules to earn achievements!</p>
        </div>
      </div>
    </div>
  )
}

export default Profile
