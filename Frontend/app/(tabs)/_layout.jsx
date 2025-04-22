import { View, Text, StyleSheet, Image, SafeAreaView, Platform, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Tabs, usePathname } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerMenu from '../components/DrawerMenu';
import { widthScale, heightScale, fontScale, getResponsivePadding } from '../components/ResponsiveUtils';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

export default function TabLayout() {
  const [activeScreen, setActiveScreen] = useState('Conversation');
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Update the active screen name based on the current path
    if (pathname.includes('convo')) {
      setActiveScreen('Conversation');
    } else if (pathname.includes('home')) {
      setActiveScreen('Home');
    } else if (pathname.includes('main')) {
      setActiveScreen('Translator');
    } else if (pathname.includes('history')) {
      setActiveScreen('History');
    } else if (pathname.includes('settings')) {
      setActiveScreen('Settings');
    }
  }, [pathname]);

  // Update UI on dimension changes
  useEffect(() => {
    const dimensionsHandler = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        // Force re-render on dimension change
        setActiveScreen(prev => prev);
      }
    );

    return () => {
      dimensionsHandler.remove();
    };
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons name="menu-outline" size={widthScale(24)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeScreen}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* Drawer Menu */}
      <DrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AF5',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: true,
          tabBarStyle: {
            height: heightScale(85),
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.05)',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            paddingBottom: heightScale(15),
            paddingTop: heightScale(5)
          },
          tabBarLabelStyle: {
            fontSize: fontScale(12),
            fontWeight: '500',
            position: 'absolute',
            bottom: heightScale(10),
          },
          tabBarIconStyle: {
            marginTop: heightScale(5)
          }
        }}
      >
        <Tabs.Screen
          name="convo"
          options={{
            tabBarLabel: 'Chat',
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name="chatbubble-outline"
                  size={widthScale(24)}
                  color={focused ? "#007AF5" : "gray"}
                />
              </View>
            )
          }}
        />

        <Tabs.Screen
          name='home'
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name="home-outline"
                  size={widthScale(24)}
                  color={focused ? "#007AF5" : "gray"}
                />
              </View>
            )
          }}
        />

        <Tabs.Screen
          name='main'
          options={{
            tabBarLabel: 'Translate',
            tabBarLabelStyle: {
              fontSize: fontScale(14), // Increased from 12
              fontWeight: '600', // Made slightly bolder
              position: 'absolute',
              bottom: heightScale(0),
              
             
            },
            tabBarIcon: ({ focused }) => (
              <View style={styles.mainTabContainer}>
                <LinearGradient
                  colors={['#007AF5', '#0055C9', '#003b8a']}
                  style={styles.mainTabButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome5
                    name="language"
                    size={widthScale(28)}
                    color="#ffffff"
                  />
                </LinearGradient>
              </View>
            )
          }}
        />

        <Tabs.Screen
          name='history'
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <MaterialIcons
                  name="history"
                  size={widthScale(24)}
                  color={focused ? "#007AF5" : "gray"}
                />
              </View>
            )
          }}
        />

        <Tabs.Screen
          name='settings'
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <SimpleLineIcons
                  name="settings"
                  size={widthScale(24)}
                  color={focused ? "#007AF5" : "gray"}
                />
              </View>
            )
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: {
    backgroundColor: '#007AF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: heightScale(15),
    paddingHorizontal: getResponsivePadding(),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuButton: {
    padding: widthScale(5),
    width: widthScale(40),
  },
  headerTitle: {
    color: '#fff',
    fontSize: fontScale(18),
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    width: widthScale(40),
  },
  topBar: {
    height: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    // elevation: 5,
    zIndex: 100
  },
  topBarText: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: widthScale(40),
    height: widthScale(40),
    marginTop: heightScale(5),
  },
  icon: {
    height: 24,
    width: 24,
    marginTop: 10,
    tintColor: 'gray',
  },
  activeIcon: {
    tintColor: '#007AF5',
  },
  // activeIndicator: {
  //   height: 4,
  //   width: 10,
  //   backgroundColor: '#007AF5',
  //   borderRadius: 2,
  //   position: 'absolute',
  //   bottom: -8,
  // },
  mainTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: heightScale(-5),
    marginBottom: heightScale(8),
    
  },
  mainTabButton: {
    width: widthScale(54),
    height: widthScale(54),
    borderRadius: widthScale(27),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  mainIcon: {
    height: widthScale(30),
    width: widthScale(30),
    tintColor: '#ffffff'
  }
});