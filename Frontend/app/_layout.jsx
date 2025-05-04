import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { router, useSegments } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';



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
  const [hasNavigated, setHasNavigated] = useState(false);
  
  useEffect(() => {
    // If authentication is still loading, do nothing yet
    if (loading) {
      console.log("Auth state is still loading...");
      return;
    }
    
    // Prevent multiple navigations
    if (hasNavigated) return;
    
    // Only redirect if not already in the correct section
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!user && !inAuthGroup) {
      console.log("No authenticated user found, redirecting to login");
      setHasNavigated(true);
      router.replace('/(auth)/login');
    } else if (user && !inTabsGroup) {
      console.log("User is authenticated, redirecting to home");
      setHasNavigated(true);
      router.replace('/(tabs)/home');
    }
  }, [user, loading, segments]);
  
  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f7'
      }}>
        <ActivityIndicator size="large" color="#007AF5" />
        <Text style={{
          marginTop: 15,
          fontSize: 16,
          color: '#666'
        }}>
          Loading Nagish...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

