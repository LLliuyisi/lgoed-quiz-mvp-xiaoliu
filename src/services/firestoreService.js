import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'

export const firestoreService = {
  // Quiz operations
  quizzes: {
    // Get all quiz categories
    getCategories: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizCategories'))
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error getting quiz categories:', error)
        return []
      }
    },

    // Get questions for a specific category
    getQuestions: async (categoryId, limit = 20) => {
      try {
        const q = query(
          collection(db, 'questions'),
          where('categoryId', '==', categoryId),
          orderBy('difficulty'),
          limit(limit)
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error getting questions:', error)
        return []
      }
    },

    // Submit quiz results
    submitQuizResult: async (userId, quizData) => {
      try {
        const result = {
          userId,
          ...quizData,
          submittedAt: new Date().toISOString()
        }
        const docRef = await addDoc(collection(db, 'quizResults'), result)
        return { success: true, id: docRef.id }
      } catch (error) {
        console.error('Error submitting quiz result:', error)
        return { success: false, error: error.message }
      }
    },

    // Get user's quiz history
    getUserQuizHistory: async (userId, limit = 50) => {
      try {
        const q = query(
          collection(db, 'quizResults'),
          where('userId', '==', userId),
          orderBy('submittedAt', 'desc'),
          limit(limit)
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error getting quiz history:', error)
        return []
      }
    }
  },

  // Learning operations
  learning: {
    // Get all learning modules
    getModules: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'learningModules'))
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error getting learning modules:', error)
        return []
      }
    },

    // Get module content
    getModuleContent: async (moduleId) => {
      try {
        const docRef = doc(db, 'learningModules', moduleId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() }
        } else {
          return null
        }
      } catch (error) {
        console.error('Error getting module content:', error)
        return null
      }
    },

    // Update user learning progress
    updateProgress: async (userId, moduleId, progress) => {
      try {
        const userProgressRef = doc(db, 'userProgress', userId)
        const userProgressSnap = await getDoc(userProgressRef)
        
        if (userProgressSnap.exists()) {
          await updateDoc(userProgressRef, {
            [`modules.${moduleId}`]: progress,
            lastUpdated: new Date().toISOString()
          })
        } else {
          await setDoc(userProgressRef, {
            userId,
            modules: { [moduleId]: progress },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          })
        }
        
        return { success: true }
      } catch (error) {
        console.error('Error updating progress:', error)
        return { success: false, error: error.message }
      }
    },

    // Get user learning progress
    getUserProgress: async (userId) => {
      try {
        const docRef = doc(db, 'userProgress', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return docSnap.data()
        } else {
          return { modules: {}, createdAt: null, lastUpdated: null }
        }
      } catch (error) {
        console.error('Error getting user progress:', error)
        return { modules: {}, createdAt: null, lastUpdated: null }
      }
    }
  },

  // User operations
  users: {
    // Get user profile
    getUserProfile: async (userId) => {
      try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() }
        } else {
          return null
        }
      } catch (error) {
        console.error('Error getting user profile:', error)
        return null
      }
    },

    // Update user profile
    updateUserProfile: async (userId, updates) => {
      try {
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          ...updates,
          lastUpdated: new Date().toISOString()
        })
        return { success: true }
      } catch (error) {
        console.error('Error updating user profile:', error)
        return { success: false, error: error.message }
      }
    },

    // Add achievement to user
    addAchievement: async (userId, achievement) => {
      try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const currentAchievements = userSnap.data().achievements || []
          const newAchievement = {
            ...achievement,
            earnedAt: new Date().toISOString()
          }
          
          await updateDoc(userRef, {
            achievements: [...currentAchievements, newAchievement],
            lastUpdated: new Date().toISOString()
          })
          
          return { success: true }
        } else {
          return { success: false, error: 'User not found' }
        }
      } catch (error) {
        console.error('Error adding achievement:', error)
        return { success: false, error: error.message }
      }
    }
  },

  // Real-time listeners
  listeners: {
    // Listen to user progress changes
    onUserProgressChange: (userId, callback) => {
      const userProgressRef = doc(db, 'userProgress', userId)
      return onSnapshot(userProgressRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data())
        } else {
          callback({ modules: {}, createdAt: null, lastUpdated: null })
        }
      })
    },

    // Listen to quiz results changes
    onQuizResultsChange: (userId, callback) => {
      const q = query(
        collection(db, 'quizResults'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(20)
      )
      return onSnapshot(q, (querySnapshot) => {
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(results)
      })
    }
  }
}

// Import setDoc for the updateProgress function
import { setDoc } from 'firebase/firestore'
