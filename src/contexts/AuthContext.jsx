import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setLoading(false)
      setError(null)
    })

    return unsubscribe
  }, [])

  const signUp = async (email, password, displayName) => {
    try {
      setError(null)
      const result = await authService.signUp(email, password, displayName)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      setError(null)
      const result = await authService.signIn(email, password)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const result = await authService.signInWithGoogle()
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const result = await authService.signOut()
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email) => {
    try {
      setError(null)
      const result = await authService.resetPassword(email)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    try {
      setError(null)
      const result = await authService.updateUserProfile(updates)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    currentUser,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
