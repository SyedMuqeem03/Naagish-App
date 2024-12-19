import { View, Text,StyleSheet,Image} from 'react-native'
import React from 'react'
import { Tabs,Stack } from 'expo-router'
import { Stacks } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import ConvoScreen from './convo'

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs screenOptions={{headerShown:false}} >
        <Tabs.Screen 
          name="convo" 
          options={{
            tabBarLabel: 'Convo',
            tabBarLabelStyle: { fontSize: 10, height: 30 },
            tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,paddingRight:10},
            tabBarIcon:()=>(<Image source={require('../convo.png')} style={styles.icon}/>)
          }}
        />

        <Tabs.Screen name='home'
          options={{tabBarLabel:'Home',tabBarLabelStyle:{fontSize:10,height:30}, 
            tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,borderBottomStartRadius:30,borderBottomRightRadius:30,paddingRight:10},
            tabBarIcon:()=>(<Image source={require('./home.png')} style={styles.icon_1}/>)
          }}
        />

        <Tabs.Screen name='main'
          options={{tabBarLabel:'',tabBarLabelStyle:{fontSize:10,height:30},
            tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,borderTopStartRadius:30,borderTopRightRadius:30,paddingRight:10},
            tabBarIcon:()=>(<Image source={require('../main.png')} style={styles.icon_2}/>)
          }}
        />
         
        <Tabs.Screen name='history'
          options={{tabBarLabel:'History',tabBarLabelStyle:{fontSize:10,height:30}, 
            tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,borderTopStartRadius:30,borderTopRightRadius:30,paddingRight:10},
            tabBarIcon:({Color})=><MaterialIcons name="history" size={24} color="black" />
          }}
        />

        <Tabs.Screen name='settings'
          options={{tabBarLabel:'settings',tabBarLabelStyle:{fontSize:10,height:30},
            tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,borderTopStartRadius:30,borderTopRightRadius:30,paddingRight:10}, 
            tabBarIcon:({Color})=><SimpleLineIcons name="settings" size={24} color="gray" />
          }}
        />
      </Tabs>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    paddingBottom:0,
  },
  icon:{
    height:30,
    width:30,
    marginTop:15
  },
  icon_1:{
    height:30,
    width:30,
    marginTop:15,
  },
  icon_2:{
    height:50,
    width:50,
    marginTop:15,
  }
});