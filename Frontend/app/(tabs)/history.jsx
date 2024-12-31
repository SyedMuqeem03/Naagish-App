import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';

export default function history() {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>History</Text>
        <Image
          source={require('../list.png')} 
          style={styles.list}  
          onPress={() => alert('list pressed!')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});