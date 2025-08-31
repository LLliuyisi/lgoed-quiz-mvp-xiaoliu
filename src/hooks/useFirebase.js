import { useState, useEffect } from 'react'
import { firestoreService } from '../services/firestoreService'
import { useAuth } from '../contexts/AuthContext'

export const useFirebase = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Quiz operations
  const getQuizCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const categories = await firestoreService.quizzes.getCategories()
      return categories
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getQuizQuestions = async (categoryId, limit = 20) => {
    setLoading(true)
    setError(null)
    try {
      const questions = await firestoreService.quizzes.getQuestions(categoryId, limit)
      return questions
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const submitQuizResult = async (quizData) => {
    if (!currentUser) {
      setError('User must be signed in to submit quiz results')
      return { success: false, error: 'User must be signed in' }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await firestoreService.quizzes.submitQuizResult(currentUser.uid, quizData)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getUserQuizHistory = async (limit = 50) => {
    if (!currentUser) {
      setError('User must be signed in to view quiz history')
      return []
    }

    setLoading(true)
    setError(null)
    try {
      const history = await firestoreService.quizzes.getUserQuizHistory(currentUser.uid, limit)
      return history
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Learning operations
  const getLearningModules = async () => {
    setLoading(true)
    setError(null)
    try {
      const modules = await firestoreService.learning.getModules()
      return modules
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getModuleContent = async (moduleId) => {
    setLoading(true)
    setError(null)
    try {
      const content = await firestoreService.learning.getModuleContent(moduleId)
      return content
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateLearningProgress = async (moduleId, progress) => {
    if (!currentUser) {
      setError('User must be signed in to update progress')
      return { success: false, error: 'User must be signed in' }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await firestoreService.learning.updateProgress(currentUser.uid, moduleId, progress)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getUserLearningProgress = async () => {
    if (!currentUser) {
      setError('User must be signed in to view learning progress')
      return { modules: {}, createdAt: null, lastUpdated: null }
    }

    setLoading(true)
    setError(null)
    try {
      const progress = await firestoreService.learning.getUserProgress(currentUser.uid)
      return progress
    } catch (err) {
      setError(err.message)
      return { modules: {}, createdAt: null, lastUpdated: null }
    } finally {
      setLoading(false)
    }
  }

  // User operations
  const getUserProfile = async () => {
    if (!currentUser) {
      setError('User must be signed in to view profile')
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const profile = await firestoreService.users.getUserProfile(currentUser.uid)
      return profile
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      setError('User must be signed in to update profile')
      return { success: false, error: 'User must be signed in' }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await firestoreService.users.updateUserProfile(currentUser.uid, updates)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const addUserAchievement = async (achievement) => {
    if (!currentUser) {
      setError('User must be signed in to add achievements')
      return { success: false, error: 'User must be signed in' }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await firestoreService.users.addAchievement(currentUser.uid, achievement)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Real-time listeners
  const subscribeToUserProgress = (callback) => {
    if (!currentUser) return null
    return firestoreService.listeners.onUserProgressChange(currentUser.uid, callback)
  }

  const subscribeToQuizResults = (callback) => {
    if (!currentUser) return null
    return firestoreService.listeners.onQuizResultsChange(currentUser.uid, callback)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    // State
    loading,
    error,
    
    // Quiz operations
    getQuizCategories,
    getQuizQuestions,
    submitQuizResult,
    getUserQuizHistory,
    
    // Learning operations
    getLearningModules,
    getModuleContent,
    updateLearningProgress,
    getUserLearningProgress,
    
    // User operations
    getUserProfile,
    updateUserProfile,
    addUserAchievement,
    
    // Real-time listeners
    subscribeToUserProgress,
    subscribeToQuizResults,
    
    // Utility
    clearError
  }
}
