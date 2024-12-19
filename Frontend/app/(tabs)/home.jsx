import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleImagePress = () => {
    setIsImageExpanded(true);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsImageExpanded(false);
  };

  const handleNavigateToSettings = () => {
    setIsModalVisible(false);
    setIsImageExpanded(false);
    navigation.navigate('settings'); 
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity onPress={() => alert('list pressed!')}>
          <Image source={require('../list.png')} style={styles.list} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <TouchableOpacity onPress={handleImagePress}>
          <Image
            source={require('./manuser.png')}
            style={[styles.userImage, isImageExpanded && styles.expandedImage]}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Hello! User</Text>
        <Text style={styles.subTitle}>Ready to translate?</Text>
        <Text style={styles.subTitle}>Communicate seamlessly in any language</Text>

        <View style={styles.boxContainer}>
          <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('convo')}>
            <View style={styles.innerBox}>
              <Image source={require('./chat.png')} style={styles.image} resizeMode="contain" />
              <Text style={styles.boxText}>Conversation</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('main')}>
            <View style={styles.innerBox}>
              <Image source={require('./lang.png')} style={styles.image} resizeMode="contain" />
              <Text style={styles.boxText}>Language Translation</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal transparent={true} visible={isModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Go to Settings?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={handleNavigateToSettings}>
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal}>
                  <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop:40
  },
  userImage: {
    width: 100, 
    height: 100, 
    marginBottom: 60,
    borderRadius: 50, 
  },
  expandedImage: {
    width: 120,  
    height: 120, 
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#EC8305',
    marginBottom: 40,
  },
  subTitle: {
    fontSize: 19,
    color: '#024CAA',
    marginBottom: 20,
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  box: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: 155,
    height: 200,
    justifyContent: 'flex-end',
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5, 
  },
  innerBox: {
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 40,
  },
  boxText: {
    fontSize: 16,
    color: '#024CAA', 
    textAlign: 'center',
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
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#EC8305',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
    header: {
      backgroundColor: '#007AF5',
      paddingTop: 30,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
      height: 90,
      justifyContent: 'center',
      paddingLeft: 70,
      width: '100%',    
    },
    headerText: {
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
  
})

export default Home;

