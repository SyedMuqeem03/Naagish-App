import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Dimensions, Animated, StatusBar } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

// Enhanced Student Card Component
const StudentCard = ({ name, rollNo, branch, year, avatarUrl, role, github, linkedin, email }) => {
  const placeholderAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`;
  
  const openLink = (url) => {
    if (url) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(url);
    }
  };
  
  // Choose one of four color schemes for variety
  const colorSchemes = [
    {gradient: ['#FF7F50', '#FF6347'], role: '#FF5733', label: '#FF8C66'}, // Coral
    {gradient: ['#9370DB', '#8A2BE2'], role: '#7B68EE', label: '#9283E8'}, // Purple
    {gradient: ['#20B2AA', '#00CED1'], role: '#00A9A5', label: '#4ECDC4'}, // Teal
    {gradient: ['#FF8C00', '#FFA500'], role: '#FF7F00', label: '#FFA54F'}  // Orange
  ];
  
  // Use consistent color based on name to ensure same person always has same color
  const nameHash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const colorScheme = colorSchemes[nameHash % colorSchemes.length];
  
  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <LinearGradient
          colors={colorScheme.gradient}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image 
            source={{ uri: avatarUrl || placeholderAvatar }} 
            style={styles.avatar} 
          />
        </LinearGradient>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{name}</Text>
          
          {role && (
            <View style={[styles.roleContainer, {backgroundColor: `${colorScheme.role}15`, borderColor: `${colorScheme.role}30`}]}>
              <Text style={[styles.cardRole, {color: colorScheme.role}]}>{role}</Text>
            </View>
          )}
          
          <View style={styles.infoGrid}>
            <View style={[styles.infoItem, styles.infoBorder]}>
              <Text style={[styles.infoLabel, {color: colorScheme.label}]}>Roll No</Text>
              <Text style={styles.infoValue}>{rollNo}</Text>
            </View>
            
            <View style={[styles.infoItem, styles.infoBorder]}>
              <Text style={[styles.infoLabel, {color: colorScheme.label}]}>Branch</Text>
              <Text style={styles.infoValue}>{branch}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, {color: colorScheme.label}]}>Year</Text>
              <Text style={styles.infoValue}>{year}</Text>
            </View>
          </View>
          
          <View style={styles.socialLinks}>
            {github && (
              <TouchableOpacity 
                onPress={() => openLink(github)}
                style={[styles.socialButton, {backgroundColor: `${colorScheme.role}10`}]}>
                <FontAwesome name="github" size={22} color={colorScheme.role} />
              </TouchableOpacity>
            )}
            
            {linkedin && (
              <TouchableOpacity 
                onPress={() => openLink(linkedin)}
                style={[styles.socialButton, {backgroundColor: '#E8F4FF'}]}
              >
                <FontAwesome name="linkedin-square" size={22} color="#0077B5" />
              </TouchableOpacity>
            )}
            
            {email && (
              <TouchableOpacity 
                onPress={() => openEmail(email)}
                style={[styles.socialButton, {backgroundColor: '#FFF2F0'}]}
              >
                <Ionicons name="mail" size={22} color="#D44638" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function About() {
  // Enhanced animation state
  const [scrollY] = React.useState(new Animated.Value(0));
  
  // Multiple interpolations for different elements
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [220, 120],
    extrapolate: 'clamp'
  });
  
  const iconScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.7],
    extrapolate: 'clamp'
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 12],
    extrapolate: 'clamp'
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.85],
    extrapolate: 'clamp'
  });
  
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 40, 80],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp'
  });
  
  const taglineOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });

  // Enhanced student data with roles and social links
  const students = [
    {
      name: 'Shajiya Dalwale',
      rollNo: '09',
      branch: 'CSE',
      year: 'Final Year',
      role: 'Frontend Developer',
      github: 'https://github.com/shajiya',
      linkedin: 'https://linkedin.com/in/shajiya',
      email: 'shajiya@example.com'
    },
    {
      name: 'Pragati Koli',
      rollNo: '10',
      branch: 'CSE',
      year: 'Final Year',
      role: 'UI/UX Designer',
      github: 'https://github.com/pragati',
      linkedin: 'https://linkedin.com/in/pragati',
      email: 'pragati@example.com'
    },
    {
      name: 'Ashlesha Shinde',
      rollNo: '11',
      branch: 'CSE',
      year: 'Final Year',
      role: 'Backend Developer',
      github: 'https://github.com/ashlesha',
      linkedin: 'https://linkedin.com/in/ashlesha',
      email: 'ashlesha@example.com'
    },
    {
      name: 'Muskan Buwashe',
      rollNo: '12',
      branch: 'CSE',
      year: 'Final Year',
      role: 'ML Engineer',
      github: 'https://github.com/muskan',
      linkedin: 'https://linkedin.com/in/muskan',
      email: 'muskan@example.com'
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Enhanced Animated Header */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <LinearGradient
          colors={['#007AF5', '#0055C9']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animated.View 
              style={[
                styles.appIconContainer, 
                {transform: [{scale: iconScale}]}
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.appIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="language" size={40} color="#fff" />
              </LinearGradient>
            </Animated.View>
            
            <View style={styles.titleContainer}>
              <Animated.View 
                style={[
                  styles.titleWrapper,
                  {
                    transform: [
                      {translateY: titleTranslateY},
                      {scale: titleScale}
                    ]
                  }
                ]}
              >
                <Text style={styles.titlePrefix}>Nagish</Text>
                <Text style={styles.title}>About Us</Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.subtitleBox,
                  {opacity: subtitleOpacity}
                ]}
              >
                <Ionicons name="people-circle-outline" size={18} color="#fff" style={styles.subtitleIcon} />
                <Text style={styles.subtitle}>The Minds Behind Nagish</Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.taglineWrapper,
                  {opacity: taglineOpacity}
                ]}
              >
                <View style={styles.taglineDecoratorLeft} />
                <View style={styles.taglineContainer}>
                  <Text style={styles.tagline}>Building bridges through technology</Text>
                </View>
                <View style={styles.taglineDecoratorRight} />
              </Animated.View>
            </View>
          </View>
          
          {/* Decorative wave pattern at bottom of header */}
          <View style={styles.wavyPattern}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <View key={i} style={[styles.wave, { left: `${(i-1) * 12.5}%` }]} />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.scrollContent}>
          {/* Team section - keep this the same */}
          <View style={styles.teamSection}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FD']}
              style={styles.teamSectionContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <LinearGradient
                    colors={['#7B61FF', '#5B3FD9']}
                    style={styles.sectionIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="people" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Our Team</Text>
                  <Text style={styles.sectionSubtitle}>The creative minds behind Nagish</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <Text style={styles.description}>
                We are final year Computer Science students from N B Navale Sinhgad College of Engineering (NBNSCOE), Solapur, 
                passionate about creating technologies that make communication easier 
                and more accessible for everyone.
              </Text>
            </LinearGradient>
          </View>

          {/* Update the card container with enhanced styling */}
          <View style={styles.cardsContainer}>
            {students.map((student, index) => (
              <StudentCard key={index} {...student} />
            ))}
          </View>
          
          {/* Project info with enhanced styling */}
          <LinearGradient
            colors={['#F8F9FD', '#EDF2FF']}
            style={styles.projectInfo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.projectIntro}>
              <Ionicons name="information-circle" size={32} color="#007AF5" style={styles.projectIcon} />
              <Text style={styles.projectTitle}>About Nagish App</Text>
            </View>
            
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
          </LinearGradient>
          
          <LinearGradient
            colors={['#007AF5', '#0055C9']}
            style={styles.footer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.footerText}>© 2025 Nagish Team</Text>
            <Text style={styles.footerSubtext}>Breaking language barriers, one conversation at a time</Text>
          </LinearGradient>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// Update these styles to improve scroll behavior
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
   
  },
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 50,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start', // Change to flex-start for better control
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  appIconContainer: {
    marginRight: 15,
    marginTop: 5, // Add some top margin
  },
  appIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleContainer: {
    flex: 1,
    paddingTop: 0, // Add padding to align with icon
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  titlePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AAD4FF',
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    height: 32, // Fixed height so it collapses nicely
  },
  subtitleIcon: {
    marginRight: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  taglineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  taglineDecoratorLeft: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 10,
  },
  taglineDecoratorRight: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginLeft: 10,
  },
  taglineContainer: {
    backgroundColor: 'rgba(0,83,180,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tagline: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  wavyPattern: {
    height: 20,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    width: '25%',
    height: 20,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    paddingTop: 20,
  },
  teamSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    marginTop: 10,
  },
  teamSectionContent: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIconContainer: {
    marginRight: 10,
  },
  sectionIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  cardsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardWrapper: {
    width: cardWidth,
    marginBottom: 25,
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    // Enhanced border
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    // Additional border accent on top
    borderTopWidth: 4,
    borderTopColor: '#7B61FF',
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleContainer: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  cardRole: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoBorder: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  socialLinks: {
    flexDirection: 'row',
    marginTop: 5,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  projectInfo: {
    padding: 24,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 25,
    borderRadius: 20,
    // Enhanced border with subtle highlight
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#007AF5',
    // Enhanced shadow
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    // Add some depth with background
    backgroundColor: '#FFFFFF',
  },
  projectIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  projectIcon: {
    marginRight: 10,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 15,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  }
});