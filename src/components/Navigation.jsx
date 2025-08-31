import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navigation = () => {
  const { currentUser, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">AlgoEd Quiz</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/quiz">Quiz</Link></li>
        <li><Link to="/learn">Learn</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/host">Host</Link></li>
      </ul>
      
      <div className="nav-auth">
        {currentUser ? (
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </span>
              <span className="user-name">{currentUser.displayName || 'User'}</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-email">{currentUser.email}</p>
                </div>
                <button 
                  className="dropdown-item"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/signin" className="btn btn-outline btn-small">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-small">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
