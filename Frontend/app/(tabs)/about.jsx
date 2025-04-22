import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Student Card Component
const StudentCard = ({ name, rollNo, branch, year, avatarUrl }) => {
  // Generate a placeholder avatar if no URL provided
  const placeholderAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=100`;
  
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#007AF5', '#0055C9']}
        style={styles.cardHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.cardTitle}>{name}</Text>
      </LinearGradient>
      
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: avatarUrl || placeholderAvatar }} 
          style={styles.avatar} 
        />
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Roll No:</Text>
            <Text style={styles.infoValue}>{rollNo}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Branch:</Text>
            <Text style={styles.infoValue}>{branch}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year:</Text>
            <Text style={styles.infoValue}>{year}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function About() {
  // Student data
  const students = [
    {
      name: 'Shajiya Dalwale',
      rollNo: '09',
      branch: 'CSE',
      year: 'Final Year',
    },
    {
      name: 'Pragati Koli',
      rollNo: '10',
      branch: 'CSE',
      year: 'Final Year',
    },
    {
      name: 'Ashlesha Shinde',
      rollNo: '11',
      branch: 'CSE',
      year: 'Final Year',
    },
    {
      name: 'Muskan Buwashe',
      rollNo: '12',
      branch: 'CSE',
      year: 'Final Year',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.subtitle}>Meet the Team</Text>
      </View>
      
      <Text style={styles.description}>
        We are final year Computer Science students from N B Navale Sinhgad College of Engineering (NBNSCOE) ,Solapur , 
        passionate about creating technologies that make communication easier 
        and more accessible for everyone.
      </Text>
      
      <View style={styles.cardsContainer}>
        {students.map((student, index) => (
          <StudentCard key={index} {...student} />
        ))}
      </View>
      
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>About Nagish App</Text>
        <Text style={styles.projectDescription}>
          Nagish is a communication facilitator app designed to bridge language and regional barriers through
          real-time translation and voice synthesis. Our app makes conversations between people
          speaking different languages smooth and natural, breaking down geographical and cultural divides.
        </Text>
        
        <Text style={styles.projectDescription}>
          Beyond language translation, Nagish is specifically designed to assist individuals with hearing and speech impairments.
          Through visual transcription, text-to-speech features, and intuitive interfaces, we ensure that communication
          is accessible to everyone regardless of their abilities.
        </Text>
        
        <Text style={styles.projectDescription}>
          Our mission is to create a more inclusive world where language differences and disabilities
          no longer prevent meaningful human connection.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Nagish Team</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#007AF5',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  cardsContainer: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 15,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 70,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  projectInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 15, // Add spacing between paragraphs
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});