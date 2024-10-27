import React, { useState } from 'react';
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
  StyleSheet 
} from 'react-native';

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


  return (

    <View style={styles.navcontainer}>
    {/* Navigation Header */}
    <View style={styles.navHeader}>
      <Text style={styles.navHeaderText}>Settings</Text>
      <TouchableOpacity onPress={() => alert('list pressed!')}>
        <Image
          source={require('../list.png')} // Ensure this path is correct
          style={styles.list}
        />
      </TouchableOpacity>
    </View>

    <View style={styles.container}>
      {/* Main Content Wrapper */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.innerContainer}>
          {/* Profile Section */}
          <Image 
            source={require('@/assets/images/manuser.png')} // Ensure this path is correct
            style={styles.image}
          />
          <TouchableOpacity onPress={() => setVisibleUsernameModal(true)}>
            <Text style={styles.username}>{username}</Text>
          </TouchableOpacity>

          {/* Region Selector */}
          <View style={styles.row}>
            <Text style={styles.heading}>Region:</Text>
            <TouchableOpacity onPress={() => setVisibleRegion(true)}>
              <View style={styles.box}>
                <Text style={styles.selected}>{selectedRegion}</Text>
              </View>
            </TouchableOpacity>
            <Modal visible={visibleRegion} transparent={true}>
              <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.modal}>
                  <FlatList
                    data={regions}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => {
                        setSelectedRegion(item.value);
                        setVisibleRegion(false);
                      }}>
                        <Text style={styles.option}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                  />
                  <TouchableOpacity style={styles.closeButton} onPress={() => setVisibleRegion(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          {/* Language Selector */}
          <View style={styles.row}>
            <Text style={styles.heading}>Language:</Text>
            <TouchableOpacity onPress={() => setVisibleLanguage(true)}>
              <View style={styles.box}>
                <Text style={styles.selected}>{selectedLanguage}</Text>
              </View>
            </TouchableOpacity>
            <Modal visible={visibleLanguage} transparent={true}>
              <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.modal}>
                  <FlatList
                    data={languages}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => {
                        setSelectedLanguage(item.value);
                        setVisibleLanguage(false);
                      }}>
                        <Text style={styles.option}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                  />
                  <TouchableOpacity style={styles.closeButton} onPress={() => setVisibleLanguage(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          {/* Email Selector */}
          <View style={styles.row}>
            <Text style={styles.heading}>Email:</Text>
            <TouchableOpacity onPress={() => setVisibleEmail(true)}>
              <View style={styles.box}>
                <Text style={styles.selected}>{selectedEmail}</Text>
              </View>
            </TouchableOpacity>
            <Modal visible={visibleEmail} transparent={true}>
              <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.modal}>
                  <FlatList
                    data={emails}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => {
                        setSelectedEmail(item.value);
                        setVisibleEmail(false);
                      }}>
                        <Text style={styles.option}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                  />
                  <TouchableOpacity style={styles.closeButton} onPress={() => setVisibleEmail(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          {/* Username Change Modal */}
          <Modal visible={visibleUsernameModal} transparent={true}>
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Change Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new username"
                    value={newUsername}
                    onChangeText={setNewUsername}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={updateUsername}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </View>
     
  );
};

const styles = StyleSheet.create({

  navcontainer:{
    flex: 1,
    justifyContent: 'space-between',
    padding: 0,
    backgroundColor: '#f9f9f9',
    alignItems:'center',

    // paddingTop:10,

  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    justifyContent:"center",
    alignItems:'center',
    paddingLeft:50,

    // paddingTop:10,

  },
  // container: {
  //   flex: 1,
  //   justifyContent: 'center', // Center the content vertically
  //   alignItems: 'center', // Center the content horizontally
  //   padding: 20,
  //   backgroundColor: '#f9f9f9',
  // },
  image: {
    width: 150, 
    height: 150, 
    // marginBottom: 60,
    borderRadius: 100,
    // width: 120,
    // height: 120,
    // borderRadius: 50,
    marginLeft:50,
    marginBottom:40,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 120,
  },
  box: {
    backgroundColor: '#EC8305',
    padding: 10,
    borderRadius: 25,
    marginLeft: 'auto',
    justifyContent: 'center',
  },
  selected: {
    fontSize: 18,
    color: '#fff',
  },
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  option: {
    fontSize: 18,
    color: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#EC8305',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#EC8305',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // container: {
  //   flex: 0,
  //   justifyContent: 'space-between',
  //   padding: 100,
  //   backgroundColor: '#f9f9f9',
  // },
  navHeader: {
    backgroundColor: '#007AF5',
    paddingTop: 30,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    height: 90,
    justifyContent: 'center',
    paddingLeft: 70,
    width: '100%',    
  },
  navHeaderText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    top: 15,
    right: 10,
  },
  list: {
    height: 30,
    width: 30,
    right: 50,
    bottom: 20,
  },
});

// export default Settings;
