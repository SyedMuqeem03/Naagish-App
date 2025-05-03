import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Alert, TextInput, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { width } = Dimensions.get('window');

const DrawerMenu = ({ visible, onClose }) => {
  const router = useRouter();
  const [slideAnim] = React.useState(new Animated.Value(-width));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileHighlighted, setProfileHighlighted] = useState(false);

  // Fetch user data when drawer opens
  useEffect(() => {
    if (visible && auth.currentUser) {
      fetchUserData();
    }
  }, [visible]);

  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
      router.replace('login');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const navigateTo = (route) => {
    onClose();
    router.push(route);
  };

  const openProfileEdit = () => {
    if (!userData) {
      console.log("Cannot open profile edit: No user data");
      Alert.alert("Error", "Unable to load profile data. Please try again later.");
      return;
    }
    
    console.log("Opening profile edit, userData:", userData);
    setEditedName(userData?.displayName || '');
    setEditedBio(userData?.bio || '');
    setProfileImage(userData?.profileImage || null);
    setProfileModalVisible(true);
  };

  // Add this useEffect to monitor modal visibility
  useEffect(() => {
    if (profileModalVisible) {
      console.log("Profile modal is now visible");
    }
  }, [profileModalVisible]);

  // Update the selectProfileImage function to use the new API
  const selectProfileImage = async () => {
    try {
      // Try to detect which API version is available
      const mediaTypeOption = ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions.Images;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypeOption,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert(
        "Image Selection Failed", 
        "There was a problem selecting your image. Please try again."
      );
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      let profileImageUrl = profileImage;
      
      // Check if the profile image is a local URI (new image selected)
      if (profileImage && profileImage.startsWith('file://')) {
        // Upload the image to Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, `profile_images/${auth.currentUser.uid}_${Date.now()}`);
        
        // Convert URI to blob
        const response = await fetch(profileImage);
        const blob = await response.blob();
        
        // Upload blob to Firebase Storage
        const snapshot = await uploadBytes(imageRef, blob);
        
        // Get the download URL
        profileImageUrl = await getDownloadURL(snapshot.ref);
        console.log('Image uploaded. Download URL:', profileImageUrl);
      }
      
      // Create updated user data with the storage URL, not the local URI
      const updatedUserData = {
        displayName: editedName.trim(),
        bio: editedBio.trim(),
        profileImage: profileImageUrl,
        updatedAt: new Date()
      };
      
      // Update Firestore
      await updateDoc(userRef, updatedUserData);
      
      // Update local state with all existing user data preserved
      setUserData({
        ...userData,
        ...updatedUserData
      });
      
      // Close modal and show success feedback
      setProfileModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show success message with the updated name
      Alert.alert(
        'Profile Updated', 
        `Your profile has been successfully updated, ${editedName || 'User'}!`
      );
      
      // Highlight the updated profile area briefly
      setProfileHighlighted(true);
      setTimeout(() => setProfileHighlighted(false), 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error, error.stack);
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Drawer Modal */}
      <Modal
        transparent={true}
        visible={visible}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {/* Profile Section with highlight effect */}
            <View style={[
              styles.profileSection,
              profileHighlighted && styles.profileSectionHighlighted
            ]}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  {userData?.profileImage ? (
                    <Image 
                      source={{ uri: userData.profileImage }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {userData?.displayName 
                        ? userData.displayName[0].toUpperCase() 
                        : auth.currentUser?.email[0].toUpperCase()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.userName}>
                {userData?.displayName || 'User'}
              </Text>
              
              {userData?.bio && (
                <Text style={styles.userBio} numberOfLines={2}>
                  {userData.bio}
                </Text>
              )}
              
              <Text style={styles.userEmail}>
                {auth.currentUser?.email || ''}
              </Text>
              
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={openProfileEdit}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigateTo('/(tabs)/convo')}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigateTo('/(tabs)/home')}
              >
                <Ionicons name="home-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigateTo('/(tabs)/main')}
              >
                <FontAwesome5 name="language" size={22} color="#333" />
                <Text style={styles.menuItemText}>Translator</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigateTo('/(tabs)/history')}
              >
                <MaterialIcons name="history" size={24} color="#333" />
                <Text style={styles.menuItemText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigateTo('/(tabs)/about')}
              >
                <MaterialIcons name="info-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>About</Text>
              </TouchableOpacity>
            </View>
            
            {/* Sign Out Button at Bottom */}
            <View style={styles.signOutContainer}>
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <MaterialIcons name="logout" size={22} color="#ff3b30" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </View>
      </Modal>

      {/* Profile Edit Modal - Updated with styles from profile.jsx */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <View style={styles.profileModalHeader}>
              <Text style={styles.profileModalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => setProfileModalVisible(false)}
                style={styles.profileCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={selectProfileImage}>
                  {profileImage ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.profileAvatarImage} 
                    />
                  ) : (
                    <View style={styles.profileAvatar}>
                      <Text style={styles.profileAvatarText}>
                        {editedName ? editedName[0].toUpperCase() : auth.currentUser?.email[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.editImageButton}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="person" size={22} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={editedName}
                    onChangeText={setEditedName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <View style={[styles.inputContainer, {height: 100}]}>
                  <MaterialIcons name="info" size={22} color="#666" style={[styles.inputIcon, {paddingTop: 10}]} />
                  <TextInput
                    style={[styles.input, {textAlignVertical: 'top', height: 100, paddingTop: 10}]}
                    placeholder="A short bio about yourself"
                    value={editedBio}
                    onChangeText={setEditedBio}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
              
              <View style={styles.profileButtonRow}>
                <TouchableOpacity 
                  style={[styles.profileButton, styles.profileCancelButton]}
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={styles.profileCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.profileButton, styles.profileSaveButton]}
                  onPress={saveProfile}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={['#007AF5', '#0055C9']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.profileSaveButtonText}>Save Changes</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Existing drawer styles
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawerContainer: {
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  profileSection: {
    backgroundColor: '#007AF5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSectionHighlighted: {
    backgroundColor: '#0068D6', // Slightly different blue for highlight
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userBio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 3,
    marginBottom: 3,
    fontStyle: 'italic',
    maxWidth: '90%',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  signOutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  signOutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  
  // New profile modal styles from profile.jsx
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  profileModalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCloseButton: {
    padding: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#eee',
  },
  profileAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#eee',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AF5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  profileButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 10,
  },
  profileButton: {
    height: 50,
    borderRadius: 10,
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  profileCancelButton: {
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSaveButton: {
    overflow: 'hidden',
  },
  profileSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DrawerMenu;
