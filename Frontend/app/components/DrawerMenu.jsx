import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Alert, TextInput, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { signOut, updateDoc } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

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
    setEditedName(userData?.displayName || '');
    setEditedBio(userData?.bio || '');
    setProfileImage(userData?.profileImage || null);
    setProfileModalVisible(true);
  };

  const selectProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: editedName,
        bio: editedBio,
        profileImage: profileImage,
        updatedAt: new Date()
      });
      
      // Update local state
      setUserData({
        ...userData,
        displayName: editedName,
        bio: editedBio,
        profileImage: profileImage
      });
      
      setProfileModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <>
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
            {/* Profile Section */}
            <View style={styles.profileSection}>
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
              <Text style={styles.userEmail}>
                {auth.currentUser?.email || ''}
              </Text>
              
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={openProfileEdit} // Changed to use our new function
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
                <MaterialIcons name="people-outline" size={24} color="#333" />
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

      {/* Add the Profile Edit Modal */}
      <Modal
        transparent={true}
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.profileModalContainer}>
          <View style={styles.profileModalContent}>
            <View style={styles.profileModalHeader}>
              <Text style={styles.profileModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.profileForm}>
              {/* Profile Image Section with improved UI */}
              <View style={styles.profileImageSection}>
                <TouchableOpacity 
                  style={styles.profileImageContainer}
                  onPress={selectProfileImage}
                >
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImagePlaceholderText}>
                        {editedName ? editedName[0].toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.profileImageEditBadge}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                
                {/* Add a text prompt to make it clearer */}
                <Text style={styles.imageHelperText}>
                  Tap to change profile picture
                </Text>
                
                {/* Add buttons for different image selection options */}
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.imageOptionButton}
                    onPress={selectProfileImage}
                  >
                    <Ionicons name="images-outline" size={18} color="#007AF5" />
                    <Text style={styles.imageOptionText}>Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.imageOptionButton}
                    onPress={() => {
                      Alert.alert("Coming Soon", "This feature will be available in the next update!");
                    }}
                  >
                    <Ionicons name="camera-outline" size={18} color="#007AF5" />
                    <Text style={styles.imageOptionText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Name field with improved styling and helper text */}
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={[styles.input, {fontSize: 18}]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                autoCapitalize="words"
                maxLength={50}
              />
              <Text style={styles.inputHelper}>
                This name will be visible to other users
              </Text>

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={editedBio}
                onChangeText={setEditedBio}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.emailDisplay}>
                Email: {auth.currentUser?.email}
              </Text>
              <Text style={styles.emailNotice}>
                Email cannot be changed
              </Text>

              <View style={styles.profileModalActions}>
                <TouchableOpacity 
                  style={[styles.profileModalButton, styles.cancelButton]}
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.profileModalButton,
                    styles.saveButton,
                    saving && styles.savingButton
                  ]}
                  onPress={saveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
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
  profileModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileForm: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  emailDisplay: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
  },
  emailNotice: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  profileModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
  profileModalButton: {
    borderRadius: 8,
    padding: 15,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AF5',
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#eee',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#eee',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileImageEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AF5',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageHelperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  imageOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AF5',
  },
  inputHelper: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default DrawerMenu;
