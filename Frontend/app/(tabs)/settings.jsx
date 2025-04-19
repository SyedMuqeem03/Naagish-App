import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { widthScale, heightScale, fontScale, getResponsivePadding } from '../components/ResponsiveUtils';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

export default function Settings() {
  const [visibleRegion, setVisibleRegion] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('North India');
  const [visibleLanguage, setVisibleLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [visibleEmail, setVisibleEmail] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('Personal Email');
  const [username, setUsername] = useState('username');
  const [newUsername, setNewUsername] = useState('');
  const [visibleUsernameModal, setVisibleUsernameModal] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });

  // Track dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions({ width: window.width, height: window.height });
      }
    );
    return () => subscription.remove();
  }, []);

  const regions = [
    { label: 'North India', value: 'North India' },
    { label: 'Telangana', value: 'Telangana' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
    { label: 'Maharashtra', value: 'Maharashtra' },
  ];

  const languages = [
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Tamil', value: 'Tamil' },
    { label: 'Telugu', value: 'Telugu' },
    { label: 'Marathi', value: 'Marathi' },
  ];

  const emails = [
    { label: 'Personal Email', value: 'Personal Email' },
    { label: 'Work Email', value: 'Work Email' },
    { label: 'Other Email', value: 'Other Email' },
  ];

  const updateUsername = () => {
    if (newUsername.trim() !== '') {
      setUsername(newUsername);
      setNewUsername('');
      setVisibleUsernameModal(false);
    }
  };

  const handleOutsidePress = () => {
    setVisibleRegion(false);
    setVisibleLanguage(false);
    setVisibleEmail(false);
    setVisibleUsernameModal(false);
    Keyboard.dismiss();
  };

  // Add this function to create dynamic styles
  const getDynamicModalContent = () => {
    return {
      backgroundColor: '#fff',
      padding: widthScale(20),
      borderRadius: widthScale(10),
      width: dimensions.width > 600 ? '70%' : '85%', // Adjust width for tablets
      maxHeight: dimensions.height > 800 ? '60%' : '70%', // Adjust height based on device
    };
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.innerContainer}>
          <View style={styles.profileSection}>
            <Image source={require('@/assets/images/manuser.png')} style={styles.image} />
            <TouchableOpacity
              style={styles.usernameContainer}
              onPress={() => setVisibleUsernameModal(true)}
            >
              <Text style={styles.username}>{username}</Text>
              <FontAwesome name="edit" size={16} color="#007AF5" style={styles.editIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account Settings</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.heading}>Region</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setVisibleRegion(true)}
              >
                <Text style={styles.selected}>{selectedRegion}</Text>
                <FontAwesome name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.row}>
              <Text style={styles.heading}>Language</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setVisibleLanguage(true)}
              >
                <Text style={styles.selected}>{selectedLanguage}</Text>
                <FontAwesome name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.row}>
              <Text style={styles.heading}>Email</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setVisibleEmail(true)}
              >
                <Text style={styles.selected}>{selectedEmail}</Text>
                <FontAwesome name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal for region selection */}
          <Modal visible={visibleRegion} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, getDynamicModalContent()]}>
                  <Text style={styles.modalTitle}>Select Region</Text>
                  <FlatList
                    data={regions}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          selectedRegion === item.value && styles.selectedOption
                        ]}
                        onPress={() => {
                          setSelectedRegion(item.value);
                          setVisibleRegion(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedRegion === item.value && styles.selectedOptionText
                          ]}
                        >
                          {item.label}
                        </Text>
                        {selectedRegion === item.value && (
                          <FontAwesome name="check" size={16} color="#007AF5" />
                        )}
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setVisibleRegion(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Modal for language selection */}
          <Modal visible={visibleLanguage} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, getDynamicModalContent()]}>
                  <Text style={styles.modalTitle}>Select Language</Text>
                  <FlatList
                    data={languages}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          selectedLanguage === item.value && styles.selectedOption
                        ]}
                        onPress={() => {
                          setSelectedLanguage(item.value);
                          setVisibleLanguage(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedLanguage === item.value && styles.selectedOptionText
                          ]}
                        >
                          {item.label}
                        </Text>
                        {selectedLanguage === item.value && (
                          <FontAwesome name="check" size={16} color="#007AF5" />
                        )}
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setVisibleLanguage(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Modal for email selection */}
          <Modal visible={visibleEmail} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, getDynamicModalContent()]}>
                  <Text style={styles.modalTitle}>Select Email Type</Text>
                  <FlatList
                    data={emails}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          selectedEmail === item.value && styles.selectedOption
                        ]}
                        onPress={() => {
                          setSelectedEmail(item.value);
                          setVisibleEmail(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedEmail === item.value && styles.selectedOptionText
                          ]}
                        >
                          {item.label}
                        </Text>
                        {selectedEmail === item.value && (
                          <FontAwesome name="check" size={16} color="#007AF5" />
                        )}
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setVisibleEmail(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Username edit modal */}
          <Modal visible={visibleUsernameModal} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, getDynamicModalContent()]}>
                  <Text style={styles.modalTitle}>Change Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new username"
                    value={newUsername}
                    onChangeText={setNewUsername}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={updateUsername}>
                    <Text style={styles.submitButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: getResponsivePadding(),
    paddingTop: heightScale(10),
  },
  innerContainer: {
    flex: 1,
    width: '100%',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: heightScale(20),
  },
  image: {
    width: widthScale(100),
    height: widthScale(100),
    borderRadius: widthScale(50),
    marginBottom: heightScale(10),
    borderWidth: 3,
    borderColor: '#007AF5',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: '#333',
    marginRight: widthScale(8),
  },
  editIcon: {
    marginTop: heightScale(2),
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: widthScale(10),
    padding: widthScale(15),
    marginVertical: heightScale(10),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    marginBottom: heightScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: heightScale(10),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#007AF5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: heightScale(12),
  },
  heading: {
    fontSize: fontScale(16),
    color: '#333',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: heightScale(6),
    paddingHorizontal: widthScale(10),
  },
  selected: {
    fontSize: fontScale(16),
    color: '#007AF5',
    marginRight: widthScale(8),
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: widthScale(20),
    borderRadius: widthScale(10),
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: heightScale(15),
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: heightScale(12),
    paddingHorizontal: widthScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#f5f9ff',
  },
  optionText: {
    fontSize: fontScale(16),
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AF5',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: heightScale(15),
    backgroundColor: '#007AF5',
    paddingVertical: heightScale(12),
    borderRadius: widthScale(6),
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: widthScale(12),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: widthScale(6),
    marginBottom: heightScale(20),
    fontSize: fontScale(16),
  },
  submitButton: {
    backgroundColor: '#007AF5',
    paddingVertical: heightScale(12),
    borderRadius: widthScale(6),
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
});
