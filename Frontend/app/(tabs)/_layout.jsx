
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

      //   <LinearGradient 
      //   colors={['#6750A4', '#004284']} 
      //   start={{ x: 0, y: 0 }} 
      //    end={{ x: 0, y: 0 }} 
      //    locations={[0.05, 1,]} 
      //   style={styles.container}
      // >

        <View style={styles.container}>

       
       <Tabs screenOptions={{headerShown:false }} >

      
    
       {/* <Tabs.Screen name='convo' 
        options={{tabBarLabel:'Convo',tabBarLabelStyle:{fontSize:10,height:30}, 
            tabBarStyle:{height:90,position:'absolute',backgroundColor:"lightblue",width:400,borderRadius:70},
          // tabBarIcon:({Color})=><Ionicons name="people-circle-outline" size={24} color="gray" />
          tabBarIcon:({Color})=><FontAwesome5 name="users" size={24} color="black" />
        }}
        />  */}
{/* 
<Tabs.Screen 
  name="convo" 
  component={ConvoScreen}  // Add the component to render
  options={{
    tabBarLabel: 'Convo',
    tabBarLabelStyle: { fontSize: 10, height: 30 },
    tabBarStyle: { height: 90, position: 'absolute', backgroundColor: 'lightblue', width: 400, borderRadius: 70 },
    tabBarIcon: ({ color }) => <FontAwesome5 name="users" size={24} color="black" />
  }}
/> */}
 <Tabs.Screen 
          name="convo" 
          options={{
            tabBarLabel: 'Convo',
            tabBarLabelStyle: { fontSize: 10, height: 30 },
            tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,paddingRight:10},
            tabBarIcon:()=>(
              <Image
              source={require('../convo.png')} 
              style={styles.icon}
            />
            )
          }}
        />

<Tabs.Screen name='home'
        options={{tabBarLabel:'Home',tabBarLabelStyle:{fontSize:10,height:30}, 
        tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,borderBottomStartRadius:30,borderBottomRightRadius:30,paddingRight:10},
        tabBarIcon:()=>(
          <Image
          source={require('./home.png')} 
          style={styles.icon_1}
        />
        )
      }}
        />


<Tabs.Screen  name='main'
        options={{tabBarLabel:'',tabBarLabelStyle:{fontSize:10,height:30},
        tabBarStyle:{height:80,position:'absolute',backgroundColor:"#F7F2FA",width:400,borderTopStartRadius:30,borderTopRightRadius:30,paddingRight:10},
        // tabBarIcon:({Color})=><MaterialIcons name="translate" size={32} color="white" backgroundColor="#003366"  />
        tabBarIcon:()=>(
          <Image
          source={require('../main.png')} 
          style={styles.icon_2}
        />
        )
        


            // <Ionicons name="home" size={24} color='gray' />
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
      //  </LinearGradient>

       )
   
        // return (
        //   <Stack>
        //     <Stack.Screen name="(tabs)" options={{
        //       headerShown:false
        //     }}/>
        //   </Stack>
        // );


    }
 
    


    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 0,
        // paddingTop:40,
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


// export default function TabLayout() {
//   return (
//     <Stack>
//       <Stack.Screen name="(tabs)" options={{ headerShown:false }} />
//       <Tabs screenOptions={{ headerShown: false }}>
//         <Tabs.Screen 
//           name="home"
//           options={{
//             tabBarLabel: 'Home',
//             tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
//           }}
//         />
//         <Tabs.Screen 
//           name="profile"
//           options={{
//             tabBarLabel: 'Profile',
//             tabBarStyle: { height: 70, position: 'absolute', backgroundColor: "lightblue", width: '100%', borderRadius: 70 },
//             tabBarIcon: ({ color }) => <Ionicons name="people-circle-outline" size={24} color={color} />
//           }}
//         />
//         <Tabs.Screen 
//           name="settings"
//           options={{
//             tabBarLabel: 'Settings',
//             tabBarIcon: ({ color }) => <SimpleLineIcons name="settings" size={24} color={color} />
//           }}
//         />
//       </Tabs>
//     </Stack>
//   );
// }