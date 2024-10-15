import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface UserProfile {
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userProfile: null,
  loading: true,
  error: null,
  isNewUser: false,
  updateUserProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'user');
            setUserProfile(userData.profile || null);
            setIsNewUser(!userData.profile);
          } else {
            setUserRole('user');
            setIsNewUser(true);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(t('firebaseUnavailable'));
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [t]);

  const updateUserProfile = async (profile: UserProfile) => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { profile }, { merge: true });
      setUserProfile(profile);
      setIsNewUser(false);
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw new Error(t('profileUpdateError'));
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    error,
    isNewUser,
    updateUserProfile,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};