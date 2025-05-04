import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, 
      (authUser) => {
        console.log("Auth state changed:", authUser ? `User: ${authUser.uid}` : "No user");
        setUser(authUser);
        setLoading(false);
        
        // Save auth state to AsyncStorage
        if (authUser) {
          AsyncStorage.setItem('userAuth', JSON.stringify({
            uid: authUser.uid,
            email: authUser.email
          }));
        } else {
          AsyncStorage.removeItem('userAuth');
        }
      },
      (error) => {
        console.error("Auth error:", error);
        setUser(null);
        setLoading(false);
      }
    );

    // Check for cached auth on startup
    const checkCachedAuth = async () => {
      try {
        const cachedAuth = await AsyncStorage.getItem('userAuth');
        if (cachedAuth && !user) {
          console.log("Found cached auth");
        }
      } catch (error) {
        console.error("Error checking cached auth:", error);
      }
    };
    
    checkCachedAuth();
    
    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  // Provide the context value
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}