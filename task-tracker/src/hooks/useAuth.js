import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../services/firebase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signUpWithEmail = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with first and last name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim()
      });

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGithub = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, githubProvider);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    loading,
    error
  };
}; 