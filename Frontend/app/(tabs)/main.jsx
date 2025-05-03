import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import React, { useState, useEffect, useRef, useContext } from "react";
import { Audio } from "expo-av";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Button } from "@/components/ui/Button";
import { Colors, BorderRadius, Typography, Spacing, Shadows } from "@/constants/Theme";
import { scale, moderateScale, fontScale } from "@/utils/ResponsiveUtils";
import * as Clipboard from 'expo-clipboard';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { TranslationContext } from './_layout';

const languages_list = [
  // { name: "English", code: "en-US" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Telugu", code: "te-IN" },
  { name: "Punjabi", code: "pa-IN" },
  { name: "Tamil", code: "ta-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Bengali", code: "bn-IN" },
  { name: "Gujarati", code: "gu-IN" },
  { name: "Marathi", code: "mr-IN" },
  { name: "Malayalam", code: "ml-IN" },
  { name: "Odia", code: "od-IN" },
];

export default function Translation() {
  const [inputText, setInputText] = useState("");
  const [audioBase64, setAudioBase64] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState({ name: "Marathi", code: "mr-IN" });
  const [targetLanguage, setTargetLanguage] = useState({ name: "Telugu", code: "hi-IN" });
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const inputRef = useRef(null);
  const { isTranslating, setIsTranslating, terminateTranslation, abortControllerRef, activeTab } = useContext(TranslationContext);
  
  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Update dimensions on window resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions(window);
      }
    );
    return () => subscription.remove();
  }, []);

  // Replace the existing useEffect with this updated version
  useEffect(() => {
    const params = router.params;
    console.log("Received params:", params);
    
    if (params?.inputText) {
      setInputText(params.inputText);
      
      if (params.sourceLanguage && params.sourceCode) {
        setSourceLanguage({
          name: params.sourceLanguage,
          code: params.sourceCode
        });
      }
      
      if (params.targetLanguage && params.targetCode) {
        setTargetLanguage({
          name: params.targetLanguage,
          code: params.targetCode
        });
      }
      
      console.log("Form updated with history data");
    }
  }, [router.params]); // Add router.params as a dependency

  // Listen for termination signals
  useEffect(() => {
    return () => {
      // Clean up any translation processes if component unmounts
      if (isTranslating) {
        // Cancel any API requests
        // Stop any audio recording/playback
        // Reset translation state
        console.log('Translation terminated due to component unmount');
      }
    };
  }, []);

  const playBase64Audio = async (base64String) => {
    try {
      // Validate base64 string
      if (!base64String || typeof base64String !== 'string') {
        throw new Error('Invalid audio data received');
      }
  
      // Ensure any existing sound is properly unloaded
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (err) {
          // Ignore errors during cleanup
        }
        setSound(null);
      }
  
      // Add a delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create new sound object
      const newSound = new Audio.Sound();
      
      // Configure audio first
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      // Set up event listener before loading
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        } else if (status.error) {
          console.error(`Playback error: ${status.error}`);
          setIsPlaying(false);
        }
      });
  
      // Try with explicit audio format
      console.log("Attempting to load audio...");
      await newSound.loadAsync(
        { uri: `data:audio/mpeg;base64,${base64String}` },
        { shouldPlay: false, volume: 1.0, progressUpdateIntervalMillis: 100 },
        true
      );
      
      setSound(newSound);
      console.log("Audio loaded successfully");
      
      // Play audio
      const playbackStatus = await newSound.playAsync();
      console.log("Playback started:", playbackStatus);
      setIsPlaying(true);
      
      // Add haptic feedback
      Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
      
    } catch (error) {
      console.error("Error playing sound:", error);
      
      // Try alternative format if first attempt fails
      try {
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }
        
        const newSound = new Audio.Sound();
        
        // Try with WAV format instead
        await newSound.loadAsync(
          { uri: `data:audio/wav;base64,${base64String}` },
          { shouldPlay: false, volume: 1.0 },
          false
        );
        
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
        
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        Alert.alert(
          "Audio Error", 
          "Could not play the audio. The format may be unsupported on this device."
        );
        setIsPlaying(false);
      }
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        console.log('Stopping audio playback'); // Added logging
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText("");
    setAudioBase64("");
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const translateText = async () => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Please enter text to translate");
      return;
    }

    setIsLoading(true);
    setIsTranslating(true);
    
    // Create a new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      const apiEndpoint = "https://tts-api-kohl.vercel.app/translate_and_speak";
      const requestBody = {
        text: inputText,
        language: sourceLanguage.code,
        target_language: targetLanguage.name.toLowerCase(),
        voice_model: "meera"
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal // Add the abort signal here
      });

      if (response.ok) {
        const result = await response.json();
        setTranslatedText(result.translated_text);
        
        if (result.audio_data) {
          setAudioBase64(result.audio_data);
        }
        
        // Pass the translated text directly from the API response
        await saveTranslationToHistory(inputText, result.translated_text, sourceLanguage, targetLanguage, result.audio_data);
        
        // Play audio after a short delay to ensure UI has updated
        setTimeout(() => {
          playBase64Audio(result.audio_data);
        }, 100);
        
        // Provide success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error("API Error:", response.status);
        Alert.alert("Translation Error", "Failed to translate text. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      // Check if this is an abort error (user navigated away)
      if (error.name === 'AbortError') {
        console.log('Translation was cancelled');
      } else {
        console.error("Error:", error);
        Alert.alert("Network Error", "Please check your internet connection and try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
      setIsTranslating(false);
      // Clear the abort controller reference
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const clearInput = () => {
    setInputText("");
    inputRef.current?.focus();
  };

  // Update the saveTranslationToHistory function to include audio data

const saveTranslationToHistory = async (originalText, translatedText, sourceLanguage, targetLanguage, audioData) => {
  if (!auth.currentUser) {
    console.log("Not logged in, can't save translation");
    return;
  }
  
  try {
    const userId = auth.currentUser.uid;
    console.log('Saving translation for user:', userId);
    
    const historyRef = collection(db, "users", userId, "translations");
    
    const doc = {
      originalText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      timestamp: serverTimestamp(),
      hasAudio: !!audioData,
      audioData: audioData, // Store the base64 audio
      source: 'translator'
    };
    
    const docRef = await addDoc(historyRef, doc);
    console.log('Translation saved with ID:', docRef.id);
    
  } catch (error) {
    console.error('Error saving translation:', error);
  }
};

  const handleCancelTranslation = () => {
    stopAudio();
    terminateTranslation();
  };

  // Update your useEffect to add tab change cleanup
  useEffect(() => {
    return () => {
      // Clean up when component unmounts or tab changes
      if (isTranslating || isPlaying) {
        stopAudio();
        terminateTranslation();
      }
    };
  }, [isTranslating, isPlaying]);

  // Add this useEffect to monitor the active tab
  useEffect(() => {
    // This will run whenever the active tab changes
    if (activeTab !== 'Translator' && isPlaying) {
      console.log('Tab changed, stopping audio playback');
      stopAudio();
    }
  }, [activeTab, isPlaying]);

  // Then use this useEffect to monitor tab changes
  useEffect(() => {
    // This will run whenever the active tab changes
    if (activeTab && activeTab !== 'Translator' && (isPlaying || sound)) {
      console.log('Tab changed from Translator, stopping audio');
      stopAudio();
    }
  }, [activeTab, isPlaying, sound]);

  // Also ensure your cleanup is comprehensive
  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (sound) {
        console.log('Component unmounting, cleaning up audio');
        sound.unloadAsync();
      }
      
      // Make sure to abort any in-progress translations
      if (isLoading || isTranslating) {
        terminateTranslation();
      }
    };
  }, [sound, isLoading, isTranslating]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Language Selection */}
          <View style={styles.languageSelectionContainer}>
            <View style={styles.languageSelectorRow}>
              <LanguageSelector
                selectedLanguage={sourceLanguage}
                onSelectLanguage={setSourceLanguage}
                options={languages_list}
                label="From"
                style={styles.languageSelector}
              />
              
              <TouchableOpacity 
                style={styles.swapButton} 
                onPress={swapLanguages}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="swap-horizontal" size={24} color={Colors.primary.light} />
              </TouchableOpacity>
              
              <LanguageSelector
                selectedLanguage={targetLanguage}
                onSelectLanguage={setTargetLanguage}
                options={languages_list}
                label="To"
                style={styles.languageSelector}
              />
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{sourceLanguage.name}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder={`Enter text in ${sourceLanguage.name}`}
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {inputText ? (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={clearInput}
                >
                  <Ionicons name="close-circle" size={22} color={Colors.text.secondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.actionButtons}>
              <Button
                title={isLoading ? "Translating..." : "Translate"}
                onPress={translateText}
                loading={isLoading}
                disabled={isLoading || !inputText.trim()}
                variant="primary"
                fullWidth
                icon={<Ionicons name="language" size={18} color="#fff" />}
              />
            </View>
          </View>

          {/* Output/Result Card */}
          {translatedText ? (
            <View style={styles.card}>
              <View style={styles.resultHeaderRow}>
                <Text style={styles.cardTitle}>{targetLanguage.name}</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => copyToClipboard(translatedText)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="copy-outline" size={22} color={Colors.primary.light} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.playButton]}
                    onPress={isPlaying ? stopAudio : () => playBase64Audio(audioBase64)}
                    disabled={!audioBase64}
                  >
                    <Ionicons 
                      name={isPlaying ? "stop" : "volume-high"} 
                      size={22} 
                      color={Colors.primary.light} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView style={styles.translatedTextContainer}>
                <Text style={styles.translatedText}>{translatedText}</Text>
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
  },
  languageSelectionContainer: {
    marginBottom: scale(16),
  },
  languageSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageSelector: {
    flex: 1,
  },
  swapButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.accent,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: scale(8),
    ...Shadows.light,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: scale(16),
    marginBottom: scale(16),
    ...Shadows.light,
  },
  cardTitle: {
    fontSize: fontScale(Typography.fontSizes.lg),
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.primary.light,
    marginBottom: scale(12),
  },
  inputContainer: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.md,
    minHeight: scale(120),
    maxHeight: scale(200),
    padding: scale(12),
    marginBottom: scale(16),
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  textInput: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: Colors.text.primary,
    lineHeight: scale(22),
    flex: 1,
  },
  clearButton: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    zIndex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  resultActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: scale(8),
    marginLeft: scale(10),
  },
  playButton: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.round,
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  translatedTextContainer: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.md,
    padding: scale(12),
    maxHeight: scale(200),
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  translatedText: {
    fontSize: fontScale(Typography.fontSizes.md),
    color: Colors.text.primary,
    lineHeight: scale(22),
  },
});
