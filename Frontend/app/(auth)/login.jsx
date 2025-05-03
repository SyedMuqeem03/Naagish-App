import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { widthScale, heightScale, fontScale } from '../../utils/ResponsiveUtils';
import { router } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as Application from 'expo-application';

// Register for redirect callback
WebBrowser.maybeCompleteAuthSession();

// Export the provider
export const googleProvider = new GoogleAuthProvider();

// Get your Expo username and slug
const slug = "nagish-app";
// You'll need to replace with your actual Expo username
const owner = "syed_muqeem"; 

const redirectUri = makeRedirectUri({
  useProxy: true,
  native: `nagishapp://`,
  // This ensures the auth proxy service is properly set up
  proxy: `https://auth.expo.io/@${owner}/${slug}/start`
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // Update your Google auth request with an Android Client ID
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '980142842351-lqofd0f2a52kh8u9nnof14m2h24abesg.apps.googleusercontent.com',
    webClientId: '980142842351-lqofd0f2a52kh8u9nnof14m2h24abesg.apps.googleusercontent.com',
    androidClientId: '980142842351-lqofd0f2a52kh8u9nnof14m2h24abesg.apps.googleusercontent.com', // Add this line
    redirectUri: makeRedirectUri({
      scheme: 'nagishapp',
      useProxy: true,
    }),
    scopes: ['profile', 'email']
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setGoogleLoading(true);
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          const user = result.user;
          console.log("Google sign-in successful:", user.uid);
          
          try {
            // First check if the user document exists
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              // Update existing document
              await updateDoc(userDocRef, {
                lastLogin: serverTimestamp()
              });
            } else {
              // Create new user document
              await setDoc(userDocRef, {
                email: user.email,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              });
            }
          } catch (dbError) {
            console.warn("Failed to update user data:", dbError);
          }
          
          Alert.alert(
            'Login Successful', 
            'Welcome!',
            [{ text: 'Continue', onPress: () => router.replace('/(tabs)/home') }]
          );
        })
        .catch((error) => {
          console.error("Google sign-in error:", error);
          Alert.alert('Login Failed', 'Google sign-in was unsuccessful');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        })
        .finally(() => {
          setGoogleLoading(false);
        });
    }
  }, [response]);

  const validateForm = () => {
    let formErrors = {};
    
    // Email validation
    if (!email) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email format is invalid';
    }
    
    // Password validation
    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  
  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      try {
        // Sign in user with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        try {
          // First check if the user document exists
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Update existing document
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp()
            });
          } else {
            // Create new user document
            await setDoc(userDocRef, {
              email: user.email,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });
          }
        } catch (dbError) {
          console.warn("Failed to update user data:", dbError);
        }
        
        console.log("User logged in:", user.uid);
        
        // Show success alert before navigation
        Alert.alert(
          'Login Successful', 
          'Welcome back!',
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)/home') }]
        );
      } catch (error) {
        console.error("Login error details:", error.code, error.message);
        
        let errorMessage = 'Invalid email or password';
        
        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed login attempts. Try again later.';
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid login credentials.';
        } else {
          // For any other errors, show the actual error
          errorMessage = `Error: ${error.code} - ${error.message}`;
        }
        
        Alert.alert('Login Failed', errorMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await promptAsync({ useProxy: true });
    } catch (error) {
      console.error("Error starting Google sign-in:", error);
      Alert.alert('Error', 'Could not start Google sign-in process');
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          {/* <Image
            source={require('../../assets/logo.png')} // Replace with your app logo
            style={styles.logo}
            resizeMode="contain"
          /> */}
          <Text style={styles.appName}>Nagish</Text>
          <Text style={styles.tagline}>Break language barriers</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue</Text>
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.visibilityIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#007AF5', '#0055C9']}
              style={styles.loginButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          {/* <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialIcons name="facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#DB4437" />
              ) : (
                <MaterialIcons name="google" size={24} color="#DB4437" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialIcons name="phone" size={24} color="#007AF5" />
            </TouchableOpacity>
          </View> */}
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AF5',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#333',
  },
  visibilityIcon: {
    padding: 5,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AF5',
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:.30,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    color: '#666',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  noAccountText: {
    color: '#666',
    fontSize: 14,
  },
  signUpText: {
    color: '#007AF5',
    fontSize: 14,
    fontWeight: 'bold',
  },
});