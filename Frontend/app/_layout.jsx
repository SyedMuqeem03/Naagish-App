import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { router, useSegments } from 'expo-router';



// Root layout with authentication provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}

// Initial Route Component - handles redirects
function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  
  useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to login if user isn't authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to main if user is authenticated but still in auth group
      router.replace('/(tabs)/home');
    }
  }, [user, loading, segments]);
  
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

