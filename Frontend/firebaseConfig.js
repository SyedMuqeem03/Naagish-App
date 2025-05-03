import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR0ilpdGu4mbUvN4OI5zFwu9eJZrD0Oto",
  authDomain: "nagish-app-a4d39.firebaseapp.com",
  projectId: "nagish-app-a4d39",
  storageBucket: "nagish-app-a4d39.firebasestorage.app",
  messagingSenderId: "980142842351",
  appId: "1:980142842351:web:621595121b462ae2b2161a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
