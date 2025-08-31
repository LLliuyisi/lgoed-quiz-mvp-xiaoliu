import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// Google provider for sign-in
const googleProvider = new GoogleAuthProvider()

export const authService = {
  // Sign up with email and password
  signUp: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName })
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        quizHistory: [],
        learningProgress: {},
        achievements: []
      })
      
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      })
      
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          quizHistory: [],
          learningProgress: {},
          achievements: []
        })
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        })
      }
      
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback)
  },

  // Update user profile
  updateUserProfile: async (updates) => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user signed in')
      
      await updateProfile(user, updates)
      
      // Also update Firestore document
      if (updates.displayName) {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: updates.displayName
        })
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
