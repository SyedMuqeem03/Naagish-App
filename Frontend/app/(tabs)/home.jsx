import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { widthScale, heightScale, fontScale, getResponsivePadding } from '../components/ResponsiveUtils';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

const Home = () => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState([]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [cachedUserData, setCachedUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [translationsLoading, setTranslationsLoading] = useState(true);
  const [translationCount, setTranslationCount] = useState(0);

  // First check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        loadCachedUserData();
      } else {
        // No user is signed in, redirect to login
        console.log("No authenticated user found, redirecting to login");
        setLoading(false);
        router.replace('/login');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loadCachedUserData = async () => {
    try {
      // Try to load cached data first for immediate display
      const cachedDataJson = await AsyncStorage.getItem('userData');
      if (cachedDataJson) {
        const cachedData = JSON.parse(cachedDataJson);
        setUserData(cachedData);
        setCachedUserData(cachedData);
      }
      
      // Then fetch fresh data if user is logged in
      if (auth.currentUser) {
        fetchUserData();
        fetchTranslationCount();
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
      
      // Fall back to network fetch only
      if (auth.currentUser) {
        fetchUserData();
        fetchTranslationCount();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      setUserDataLoading(false);
      return;
    }
    
    setUserDataLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        
        // Cache the user data
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(data));
        } catch (cacheError) {
          console.error("Error caching user data:", cacheError);
        }
      } else {
        // User document doesn't exist - create a basic one
        console.log("No user document found, creating basic profile");
        const basicUserData = {
          email: auth.currentUser.email,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        setUserData(basicUserData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setUserDataLoading(false);
    }
  };

  const fetchTranslationCount = async () => {
    if (!auth.currentUser) return;
    
    setTranslationsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      
      // More efficient - use collection count instead of loading all docs
      const translationsRef = collection(db, "users", userId, "translations");
      const querySnapshot = await getDocs(translationsRef);
      setTranslationCount(querySnapshot.size); // Just get the count
    } catch (error) {
      console.error("Error fetching translation count:", error);
    } finally {
      setTranslationsLoading(false);
    }
  };

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions({ width: window.width, height: window.height });
      }
    );
    return () => subscription.remove();
  }, []);

  // Get display name or email
  const getUserDisplayName = () => {
    if (userDataLoading && !userData) return "Loading...";
    if (userData?.displayName) return userData.displayName;
    return auth.currentUser?.email?.split('@')[0] || "User";
  };

  const handleProfilePress = () => {
    router.push('/history');
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Today';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient
        colors={['#f5f7fa', '#e4ebf5']}
        style={styles.container}
      >
        {/* Enhanced Profile Section */}
        <LinearGradient
          colors={['#007AF5', '#0055C9']}
          style={styles.profileGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileContent}>
            <View style={styles.profileHeader}>
              {/* Changed from TouchableOpacity to View and removed onPress handler */}
              <View style={styles.avatarContainer}>
                {userData?.profileImage ? (
                  <Image
                    source={{ uri: userData.profileImage }}
                    style={styles.userImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {loading ? "..." : 
                        getUserDisplayName().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {/* Removed the editIconContainer completely */}
              </View>

              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{getTimeBasedGreeting()},</Text>
                <Text style={styles.username}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    getUserDisplayName()
                  )}
                </Text>
                {userData?.bio && (
                  <Text style={styles.userBio} numberOfLines={1}>
                    {userData.bio}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {translationsLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    translationCount
                  )}
                </Text>
                <Text style={styles.statLabel}>Translations</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userDataLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    userData?.lastLogin ? formatLastActive(userData.lastLogin) : 'Today'
                  )}
                </Text>
                <Text style={styles.statLabel}>Last Active</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* App Description Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Welcome to Nagish</Text>
          <Text style={styles.infoText}>
            Your all-in-one translation companion for breaking down language barriers. 
            With real-time conversation translation and advanced text features, 
            communication has never been easier.
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>What would you like to do today?</Text>
          
          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/(tabs)/convo')}
            >
              <LinearGradient
                colors={['#007AF5', '#0055C9']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <MaterialCommunityIcons name="message-text-outline" size={widthScale(40)} color="white" />
                  <Text style={styles.cardTitle}>Conversation</Text>
                  <Text style={styles.cardDescription}>
                    Real-time speech translation between two people
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/(tabs)/main')}
            >
              <LinearGradient
                colors={['#EC8305', '#F0A137']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <MaterialCommunityIcons name="translate" size={widthScale(40)} color="white" />
                  <Text style={styles.cardTitle}>Translator</Text>
                  <Text style={styles.cardDescription}>
                    Translate text, audio, and documents across languages
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={22} color="#EC8305" />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipBullet}>
                <Text style={styles.bulletText}>1</Text>
              </View>
              <Text style={styles.tipText}>
                For best conversation results, speak clearly and pause between sentences.
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipBullet}>
                <Text style={styles.bulletText}>2</Text>
              </View>
              <Text style={styles.tipText}>
                Use headphones in noisy environments to improve speech recognition.
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/history')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="time-outline" size={widthScale(24)} color="#007AF5" />
                </View>
                <Text style={styles.actionText}>History</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/about')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="information-circle-outline" size={widthScale(24)} color="#007AF5" />
                </View>
                <Text style={styles.actionText}>About</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Nagish Translation App v1.0.0</Text>
            <Text style={styles.copyrightText}>© 2025 Nagish Team. All rights reserved.</Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    minHeight: '100%',
    paddingHorizontal: widthScale(20),
    paddingTop: heightScale(40),
    paddingBottom: heightScale(30),
  },
  profileGradient: {
    borderRadius: widthScale(16),
    marginBottom: heightScale(30),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  profileContent: {
    padding: widthScale(20),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightScale(15),
  },
  avatarContainer: {
    marginRight: widthScale(15),
  },
  userImage: {
    width: widthScale(70),
    height: widthScale(70),
    borderRadius: widthScale(35),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarPlaceholder: {
    width: widthScale(70),
    height: widthScale(70),
    borderRadius: widthScale(35),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarText: {
    color: 'white',
    fontSize: fontScale(28),
    fontWeight: 'bold',
  },
  greetingContainer: {
    flex: 1,
    marginLeft: widthScale(15),
  },
  greeting: {
    fontSize: fontScale(16),
    color: 'rgba(255,255,255,0.9)',
  },
  username: {
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  userBio: {
    fontSize: fontScale(12),
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: widthScale(12),
    padding: widthScale(12),
    marginTop: heightScale(10),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: fontScale(12),
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: widthScale(5),
  },
  contentContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: fontScale(18),
    color: '#555',
    marginBottom: heightScale(20),
    textAlign: 'center',
  },
  cardsContainer: {
    marginBottom: heightScale(30),
  },
  card: {
    borderRadius: widthScale(16),
    marginBottom: heightScale(15),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: widthScale(20),
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: fontScale(22),
    fontWeight: 'bold',
    color: 'white',
    marginTop: heightScale(10),
    marginBottom: heightScale(5),
  },
  cardDescription: {
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: fontScale(20),
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    borderRadius: widthScale(16),
    padding: widthScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: heightScale(15),
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: widthScale(10),
  },
  actionIconContainer: {
    width: widthScale(50),
    height: widthScale(50),
    borderRadius: widthScale(25),
    backgroundColor: 'rgba(0, 122, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: heightScale(8),
  },
  actionText: {
    fontSize: fontScale(14),
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#E6F0FB',
    borderRadius: widthScale(16),
    padding: widthScale(16),
    marginBottom: heightScale(25),
    borderLeftWidth: 4,
    borderLeftColor: '#007AF5',
  },
  infoTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: heightScale(8),
  },
  infoText: {
    fontSize: fontScale(14),
    color: '#555',
    lineHeight: fontScale(20),
  },
  tipsContainer: {
    backgroundColor: '#FFF9F0',
    borderRadius: widthScale(16),
    padding: widthScale(16),
    marginBottom: heightScale(25),
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightScale(12),
  },
  tipsTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: heightScale(10),
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: widthScale(22),
    height: widthScale(22),
    borderRadius: widthScale(11),
    backgroundColor: '#EC8305',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: widthScale(10),
    marginTop: 2,
  },
  bulletText: {
    color: 'white',
    fontSize: fontScale(12),
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: fontScale(14),
    color: '#555',
    lineHeight: fontScale(20),
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: heightScale(30),
    paddingTop: heightScale(15),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  versionText: {
    fontSize: fontScale(12),
    color: '#888',
  },
  copyrightText: {
    fontSize: fontScale(10),
    color: '#aaa',
    marginTop: 2,
  },
});

export default Home;