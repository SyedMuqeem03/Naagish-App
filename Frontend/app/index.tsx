import React from 'react';
import { View, Text, StyleSheet,FlatList, ScrollView } from 'react-native';
import TabLayout from './(tabs)/_layout'; 
import { Redirect } from 'expo-router';

export default function Index(){
  return (
    <Redirect href={'/home'}/>
  )
}
