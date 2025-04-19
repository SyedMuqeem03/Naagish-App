import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { widthScale, heightScale, fontScale, getResponsivePadding } from '../components/ResponsiveUtils';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

const home = () => {
  const router = useRouter();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });

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

  // Dynamic styles based on current dimensions
  const dynamicStyles = {
    boxContainer: {
      flexDirection: 'row', // Always keep boxes side by side
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: dimensions.width < 360 ? widthScale(5) : widthScale(10),
    },
    box: {
      backgroundColor: '#fff',
      padding: dimensions.width < 360 ? widthScale(10) : widthScale(20),
      borderRadius: widthScale(20),
      width: dimensions.width < 360 ? widthScale(135) : dimensions.width < 500 ? widthScale(150) : widthScale(155),
      height: dimensions.width < 360 ? heightScale(170) : heightScale(200),
      justifyContent: 'flex-end',
      paddingBottom: heightScale(25),
      marginHorizontal: widthScale(5),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 5,
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: widthScale(20),
      borderRadius: widthScale(10),
      width: dimensions.width > 600 ? '60%' : '80%',
      alignItems: 'center',
    },
    innerBox: {
      alignItems: 'center',
    },
    image: {
      width: dimensions.width < 360 ? widthScale(80) : widthScale(100),
      height: dimensions.width < 360 ? widthScale(80) : widthScale(100),
      marginBottom: heightScale(10),
      borderRadius: widthScale(40),
    },
    boxText: {
      fontSize: dimensions.width < 360 ? fontScale(14) : fontScale(16),
      color: '#024CAA',
      textAlign: 'center',
    }
  };

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
    router.push('/settings');
  };

  return (
    <View>
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

        <View style={dynamicStyles.boxContainer}>
          <TouchableOpacity style={dynamicStyles.box} onPress={() => router.push('/convo')}>
            <View style={dynamicStyles.innerBox}>
              <Image source={require('./chat.png')} style={dynamicStyles.image} resizeMode="contain" />
              <Text style={dynamicStyles.boxText}>Conversation</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.box} onPress={() => router.push('/main')}>
            <View style={dynamicStyles.innerBox}>
              <Image source={require('./lang.png')} style={dynamicStyles.image} resizeMode="contain" />
              <Text style={dynamicStyles.boxText}>Language Translation</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal transparent={true} visible={isModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={dynamicStyles.modalContent}>
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
    padding: getResponsivePadding(),
    marginTop: heightScale(40)
  },
  userImage: {
    width: widthScale(100),
    height: widthScale(100),
    marginBottom: heightScale(60),
    borderRadius: widthScale(50),
  },
  expandedImage: {
    width: widthScale(120),
    height: widthScale(120),
  },
  title: {
    fontSize: fontScale(34),
    fontWeight: 'bold',
    color: '#EC8305',
    marginBottom: heightScale(40),
    textAlign: 'center',
  },
  subTitle: {
    fontSize: fontScale(19),
    color: '#024CAA',
    marginBottom: heightScale(20),
    textAlign: 'center',
    paddingHorizontal: widthScale(10),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    marginBottom: heightScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#EC8305',
    padding: widthScale(10),
    borderRadius: widthScale(5),
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
  },
});

export default home;