import React from 'react';
import { View, Text, StyleSheet,FlatList, ScrollView } from 'react-native';
import TabLayout from './(tabs)/_layout'; 
import { Redirect } from 'expo-router';



// export default function Index(){
//   return <Redirect href={'/home'}/>
// }

export default function Index(){
  
  return (
    // <View style={styles.container}>
    //   <View style={styles.header}>
    //     <Text style={styles.headerText}>App</Text>
    //   </View>

   


    //   <View style={styles.content}>
    //     <View style={styles.box}>
    //       <Text style={styles.boxText}>Box 1</Text>
    //     </View>
     
    //     <View style={styles.box}>
    //       <Text style={styles.boxText}>Box 2</Text>
    //     </View>
    //   </View>
     

 
<Redirect href={'/home'}/>

      
  )
      // <TabLayout />
     
      {/* return <Redirect href={'/home'}/> */}
    // </View>
    
    
  // );
 

}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     padding: 20,
//     backgroundColor: '#f9f9f9',
//   },
//   header: {
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   box: {
//     width: '100%',
//     height: 250,
//     backgroundColor: 'white',
//     borderColor: 'black',
//     borderWidth: 2,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   boxText: {
//     color: '#000', // Change to black for visibility
//     fontSize: 18,
//   },

//   // container: {
//   //   flex: 1,
//   //   paddingTop: 20,
//   //   backgroundColor: '#f9f9f9',
//   // },
//   item: {
//     backgroundColor: '#fff',
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     borderRadius: 10,
//     elevation: 1,
//   },
//   title: {
//     fontSize: 24,
//   },
// });
