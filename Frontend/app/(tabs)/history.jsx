import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from "@/constants/Theme";
import { scale, fontScale } from "@/utils/ResponsiveUtils";
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';

// Add this function at the beginning of your History component
const getLanguageColor = (languageCode) => {
  // Extract the base language code before the hyphen (e.g., "hi" from "hi-IN")
  const code = languageCode?.split('-')[0] || '';
  
  // Color mapping for Indian languages with culturally inspired colors
  const colorMap = {
    'hi': '#FF5722', // Hindi - Saffron orange
    'te': '#6B5B95', // Telugu - Royal purple
    'pa': '#0080FF', // Punjabi - Sky blue
    'ta': '#FFC107', // Tamil - Golden yellow
    'kn': '#00A86B', // Kannada - Emerald green
    'bn': '#F44336', // Bengali - Deep red
    'gu': '#FF7043', // Gujarati - Terra cotta
    'mr': '#9C27B0', // Marathi - Purple
    'ml': '#009688', // Malayalam - Teal green
    'od': '#4CAF50'  // Odia - Green
  };
  
  return colorMap[code] || '#4A6FFF'; // Default to blue if not found
};

export default function History() {
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTranslations();
  }, []);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      if (user) {
        fetchTranslations();
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Fetch user's translation history
  const fetchTranslations = async () => {
    setLoading(true);
    
    try {
      console.log('Starting to fetch translations');
      
      if (!auth.currentUser) {
        console.log('No user logged in');
        setTranslations([]);
        setLoading(false);
        return;
      }
      
      const userId = auth.currentUser.uid;
      console.log('Fetching for user ID:', userId);
      
      // IMPORTANT CHANGE: Use subcollection path instead of main collection
      const historyRef = collection(db, "users", userId, "translations");
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      
      console.log('Executing query on subcollection path');
      const querySnapshot = await getDocs(q);
      console.log('Found translations:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('No translations found in subcollection');
        setTranslations([]);
      } else {
        const translationsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing document:', doc.id, data);
          
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(),
            originalText: data.originalText || '(No text)',
            translatedText: data.translatedText || '(No translation)',
            sourceLanguage: data.sourceLanguage || { name: 'Unknown', code: 'un' },
            targetLanguage: data.targetLanguage || { name: 'Unknown', code: 'un' }
          };
        });
        
        console.log('Final processed list:', translationsList.length);
        setTranslations(translationsList);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
      Alert.alert('Error', `Failed to load translation history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete a translation from history
  const deleteTranslation = async (id) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const userId = auth.currentUser.uid;
      
      // Use correct subcollection path for deletion
      await deleteDoc(doc(db, 'users', userId, 'translations', id));
      
      // Update UI after deletion
      setTranslations(translations.filter(item => item.id !== id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error deleting translation:', error);
      Alert.alert('Error', 'Failed to delete translation');
    }
  };

  // Confirm deletion dialog
  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Translation',
      'Are you sure you want to delete this translation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => deleteTranslation(id),
          style: 'destructive'
        }
      ]
    );
  };

  // Reuse a translation by navigating to main with pre-filled data
  const reuseTranslation = (item) => {
    console.log("Reusing translation:", item.id);
    
    router.push({
      pathname: '/(tabs)/main',
      params: {
        inputText: item.originalText,
        sourceLanguage: item.sourceLanguage.name,
        sourceCode: item.sourceLanguage.code,
        targetLanguage: item.targetLanguage.name,
        targetCode: item.targetLanguage.code
      }
    });
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={70} color={Colors.text.secondary} />
      <Text style={styles.emptyTitle}>No translations yet</Text>
      <Text style={styles.emptyText}>
        Your translation history will appear here.
      </Text>
      
      <View style={styles.emptyButtonsRow}>
        <TouchableOpacity 
          style={[styles.emptyButton, styles.primaryButton]}
          onPress={() => router.push('/(tabs)/main')}
        >
          <Text style={styles.emptyButtonText}>Start Translating</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.emptyButton, styles.secondaryButton]}
          onPress={fetchTranslations}
        >
          <Ionicons name="refresh" size={20} color="#4A6FFF" />
          <Text style={[styles.emptyButtonText, {color: '#4A6FFF'}]}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render each history item
  const renderItem = ({ item }) => {
    // Get colors based on source and target languages
    const sourceColor = getLanguageColor(item.sourceLanguage.code);
    const targetColor = getLanguageColor(item.targetLanguage.code);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => openTranslationDetail(item)}
      >
        <View style={[
          styles.card, 
          { borderLeftColor: targetColor }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
            
            {/* Language pair pill with direction arrow */}
            <View style={[
              styles.languagePair,
              { 
                backgroundColor: `${targetColor}15`, 
                borderColor: `${targetColor}30` 
              }
            ]}>
              <Text style={[styles.language, { color: sourceColor }]}>
                {item.sourceLanguage.name}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={targetColor} />
              <Text style={[styles.language, { color: targetColor }]}>
                {item.targetLanguage.name}
              </Text>
            </View>
          </View>
      
          <View style={styles.textContainer}>
            {/* Language badges above each text section */}
            <View style={styles.textLangWrapper}>
              <View style={[styles.textLangBadge, {backgroundColor: `${sourceColor}15`}]}>
                <Text style={[styles.textLangText, {color: sourceColor}]}>
                  {item.sourceLanguage.name}
                </Text>
              </View>
            </View>
            
            <Text style={styles.originalText} numberOfLines={2}>
              {item.originalText}
            </Text>
            
            <Ionicons name="arrow-down" size={16} color={targetColor} style={styles.arrow} />
            
            <View style={styles.textLangWrapper}>
              <View style={[styles.textLangBadge, {backgroundColor: `${targetColor}15`}]}>
                <Text style={[styles.textLangText, {color: targetColor}]}>
                  {item.targetLanguage.name}
                </Text>
              </View>
            </View>
            
            <Text style={styles.translatedText} numberOfLines={2}>
              {item.translatedText}
            </Text>
          </View>
          
          <View style={styles.actions}>
            {item.hasAudio && (
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  { 
                    backgroundColor: '#F0F7FF',
                    borderColor: '#CCE4FF',
                    flex: 1
                  }
                ]}
                onPress={() => playAudio(item.audioData, item.id)}
                disabled={isLoading && playingId !== item.id}
              >
                {isLoading && playingId === item.id ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons 
                    name={playingId === item.id && isPlaying ? "stop-circle" : "volume-high"} 
                    size={20} 
                    color="#007AFF" 
                  />
                )}
                <Text style={[styles.actionText, {color: '#007AFF'}]}>
                  {isLoading && playingId === item.id 
                    ? "Loading..." 
                    : playingId === item.id && isPlaying 
                      ? "Stop Audio" 
                      : "Play Audio"}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: '#FFF5F5',
                  borderColor: '#FFD7D7',
                  flex: 1 // Make it take full width now that it's alone
                }
              ]}
              onPress={() => confirmDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#E53E3E" />
              <Text style={[styles.actionText, {color: '#E53E3E'}]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Add this function to handle card press
  const openTranslationDetail = (item) => {
    setSelectedTranslation(item);
  };

  // Add this function to close the detail view
  const closeTranslationDetail = () => {
    setSelectedTranslation(null);
  };

  // Add this function to your History component
  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show which type of text was copied based on length comparison
      const isOriginal = text === selectedTranslation?.originalText;
      Alert.alert(
        'Copied', 
        `${isOriginal ? 'Original' : 'Translated'} text copied to clipboard`
      );
    } catch (error) {
      console.error('Failed to copy text:', error);
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  // Add this function to play audio from base64
  const playAudio = async (base64Audio, itemId) => {
    try {
      // If same audio is playing, stop it
      if (playingId === itemId && isPlaying) {
        console.log('Stopping currently playing audio');
        await stopAudio();
        return;
      }
      
      // If different audio is playing, stop it first
      if (sound && isPlaying) {
        console.log('Stopping previous audio before playing new one');
        await stopAudio();
      }
      
      // Set loading state
      setIsLoading(true);
      
      console.log('Attempting to load audio...');
      // Check if base64Audio is valid
      if (!base64Audio || typeof base64Audio !== 'string') {
        throw new Error('Invalid audio data');
      }
      
      // Create and load the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: false }, // Don't auto-play yet
        onPlaybackStatusUpdate
      );
      
      // Update state with the new sound
      setSound(newSound);
      console.log('Audio loaded successfully');
      
      // Play the audio
      await newSound.playAsync();
      setIsPlaying(true);
      setPlayingId(itemId);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert(
        'Audio Playback Error', 
        'Unable to play this translation. The audio file may be corrupted.'
      );
      // Reset states
      setIsPlaying(false);
      setPlayingId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle audio playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      console.log('Audio playback completed');
      setIsPlaying(false);
      setPlayingId(null);
    }
  };

  // Improved stop audio function
  const stopAudio = async () => {
    try {
      if (sound) {
        if (sound._loaded) {
          console.log('Stopping loaded audio');
          await sound.stopAsync();
        }
        await sound.unloadAsync();
        setSound(null);
      }
      setIsPlaying(false);
      setPlayingId(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
      // Force reset state even if error
      setSound(null);
      setIsPlaying(false);
      setPlayingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Translation History</Text>
        {translations.length > 0 && (
          <TouchableOpacity onPress={fetchTranslations}>
            <Ionicons name="refresh" size={24} color={Colors.primary.light} />
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.light} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={translations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Translation Detail Modal */}
      <Modal
        visible={selectedTranslation !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeTranslationDetail}
      >
        {selectedTranslation && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Translation Details</Text>
                <TouchableOpacity onPress={closeTranslationDetail}>
                  <Ionicons name="close" size={24} color="#4A5568" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollContent}>
                <View style={styles.languageBadge}>
                  <Text style={styles.languageBadgeText}>
                    {selectedTranslation.sourceLanguage.name}
                  </Text>
                </View>
                
                <View style={styles.fullTextContainer}>
                  <View style={styles.textHeaderRow}>
                    <Text style={styles.textLabel}>Original Text</Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(selectedTranslation.originalText)}
                      style={styles.inlineCopyButton}
                    >
                      <Ionicons name="copy-outline" size={18} color="#4A6FFF" />
                      <Text style={styles.inlineCopyText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.fullOriginalText}>
                    {selectedTranslation.originalText}
                  </Text>
                </View>

                <View style={styles.divider}>
                  <Ionicons 
                    name="arrow-down" 
                    size={20} 
                    color={getLanguageColor(selectedTranslation.targetLanguage.code)} 
                  />
                </View>
                
                <View style={styles.languageBadge}>
                  <Text style={[
                    styles.languageBadgeText,
                    {color: getLanguageColor(selectedTranslation.targetLanguage.code)}
                  ]}>
                    {selectedTranslation.targetLanguage.name}
                  </Text>
                </View>
                
                <View style={styles.fullTextContainer}>
                  <View style={styles.textHeaderRow}>
                    <Text style={styles.textLabel}>Translation</Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(selectedTranslation.translatedText)}
                      style={styles.inlineCopyButton}
                    >
                      <Ionicons name="copy-outline" size={18} color="#4A6FFF" />
                      <Text style={styles.inlineCopyText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.fullTranslatedText}>
                    {selectedTranslation.translatedText}
                  </Text>
                </View>
                
                <Text style={styles.dateText}>
                  Translated on {formatDate(selectedTranslation.timestamp)}
                </Text>

                {/* Add an audio play button if audio exists */}
                {selectedTranslation.hasAudio && (
                  <TouchableOpacity
                    style={styles.audioPlayButton}
                    onPress={() => playAudio(selectedTranslation.audioData, selectedTranslation.id)}
                    disabled={isLoading && playingId !== selectedTranslation.id}
                  >
                    {isLoading && playingId === selectedTranslation.id ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <Ionicons
                        name={playingId === selectedTranslation.id && isPlaying ? "stop-circle" : "volume-high"}
                        size={24}
                        color="#007AFF"
                      />
                    )}
                    <Text style={styles.audioPlayText}>
                      {isLoading && playingId === selectedTranslation.id 
                        ? "Loading..." 
                        : playingId === selectedTranslation.id && isPlaying 
                          ? "Stop Audio" 
                          : "Play Audio"}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[
                    styles.modalButton, 
                    styles.deleteButton,
                    { flex: 1 } // Make it take full width
                  ]}
                  onPress={() => {
                    closeTranslationDetail();
                    confirmDelete(selectedTranslation.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
  </View>
  );
}

// Update your styles with these enhanced colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD', // Softer background with slight blue tint
    padding: scale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  title: {
    fontSize: fontScale(Typography.fontSizes.xl),
    fontWeight: Typography.fontWeights.bold,
    color: '#2D3748', // Deeper, richer text color
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: scale(80),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: scale(18),
    marginBottom: scale(18),
    ...Shadows.medium, // Enhanced shadow for better depth
    // Gradient-like effect with two borders
    borderLeftWidth: 4,
    borderLeftColor: '#4A6FFF', // Primary accent
    borderTopWidth: 1,
    borderTopColor: '#D4E3FF', // Lighter complementary color
    borderRightWidth: 1,
    borderRightColor: '#E6EEFF',
    borderBottomWidth: 1, 
    borderBottomColor: '#E6EEFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  timestamp: {
    fontSize: fontScale(Typography.fontSizes.sm),
    color: '#718096', // Softer secondary text
    fontWeight: '500',
  },
  languagePair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#EDF2FF', // Light blue background
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E0FF', // Subtle border to define the pill shape
  },
  language: {
    fontSize: fontScale(Typography.fontSizes.sm),
    fontWeight: Typography.fontWeights.semiBold,
    color: '#4A6FFF', // Bold blue for languages
  },
  textContainer: {
    padding: scale(14),
    backgroundColor: '#F7FAFC', // Slightly off-white background
    borderRadius: BorderRadius.md,
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: '#D1DCF5', // Slightly bluer border for contrast
    // Adding a subtle inner shadow effect
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  originalText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: '#4A5568', // Dark gray for readability
    marginBottom: scale(8),
  },
  arrow: {
    alignSelf: 'center',
    marginVertical: scale(6),
    color: '#A0AEC0', // Medium gray arrow
  },
  translatedText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: '#2D3748', // Darker for emphasis
    fontWeight: Typography.fontWeights.semiBold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(6),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: BorderRadius.md,
    gap: scale(8),
    borderWidth: 1,
  },
  actionText: {
    fontSize: fontScale(Typography.fontSizes.sm),
    fontWeight: Typography.fontWeights.semiBold,
    color: '#4A6FFF', // Consistent blue
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scale(16),
    fontSize: fontScale(Typography.fontSizes.md),
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(60),
  },
  emptyTitle: {
    fontSize: fontScale(Typography.fontSizes.xl),
    fontWeight: Typography.fontWeights.bold,
    color: '#2D3748',
    marginTop: scale(20),
  },
  emptyText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: '#718096',
    textAlign: 'center',
    marginTop: scale(12),
    maxWidth: '80%',
  },
  emptyButton: {
    paddingVertical: scale(14),
    paddingHorizontal: scale(20),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(Typography.fontSizes.md),
    fontWeight: Typography.fontWeights.bold,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: scale(20),
    ...Shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  modalTitle: {
    fontSize: fontScale(Typography.fontSizes.lg),
    fontWeight: Typography.fontWeights.bold,
    color: '#2D3748',
  },
  modalScrollContent: {
    maxHeight: '70%',
  },
  languageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDF2FF',
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    borderRadius: BorderRadius.md,
    marginBottom: scale(10),
  },
  languageBadgeText: {
    fontSize: fontScale(Typography.fontSizes.sm),
    fontWeight: Typography.fontWeights.semiBold,
    color: '#4A6FFF',
  },
  fullTextContainer: {
    backgroundColor: '#F7FAFC',
    padding: scale(14),
    borderRadius: BorderRadius.md,
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: '#D1DCF5',
  },
  fullOriginalText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: '#4A5568',
  },
  fullTranslatedText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: '#2D3748',
    fontWeight: Typography.fontWeights.semiBold,
  },
  divider: {
    alignItems: 'center',
    marginVertical: scale(10),
  },
  dateText: {
    fontSize: fontScale(Typography.fontSizes.sm),
    color: '#718096',
    textAlign: 'center',
    marginTop: scale(10),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(20),
    gap: scale(6), // Add gap for spacing between buttons
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    paddingVertical: scale(10),
    paddingHorizontal: scale(12), // Reduced horizontal padding for 3 buttons
    borderRadius: BorderRadius.md,
    gap: scale(6), // Reduced gap for icon and text
    flex: 1, // Make each button take equal space
  },
  modalButtonText: {
    fontSize: fontScale(Typography.fontSizes.md),
    fontWeight: Typography.fontWeights.bold,
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#E53E3E',
  },
  textHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  textLabel: {
    fontSize: fontScale(Typography.fontSizes.sm),
    fontWeight: Typography.fontWeights.medium,
    color: '#718096',
  },
  inlineCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2FF',
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    borderRadius: BorderRadius.sm,
    gap: scale(4),
  },
  inlineCopyText: {
    fontSize: fontScale(Typography.fontSizes.xs),
    color: '#4A6FFF',
    fontWeight: Typography.fontWeights.medium,
  },
  textLangWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  textLangBadge: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    borderRadius: BorderRadius.sm,
  },
  textLangText: {
    fontSize: fontScale(Typography.fontSizes.xs),
    fontWeight: Typography.fontWeights.medium,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    marginTop: scale(30),
    gap: scale(12),
  },
  primaryButton: {
    backgroundColor: '#4A6FFF',
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#EDF2FF',
    borderWidth: 1,
    borderColor: '#D4E0FF',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(6),
    elevation: 1,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  audioPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: scale(12),
    borderRadius: BorderRadius.md,
    marginVertical: scale(15),
    alignSelf: 'center',
    gap: scale(8),
    borderWidth: 1,
    borderColor: '#CCE4FF',
  },
  audioPlayText: {
    fontSize: fontScale(Typography.fontSizes.md),
    fontWeight: Typography.fontWeights.semiBold,
    color: '#007AFF',
  },
});

