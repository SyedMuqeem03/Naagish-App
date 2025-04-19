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
import React, { useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Button } from "@/components/ui/Button";
import { Colors, BorderRadius, Typography, Spacing, Shadows } from "@/constants/Theme";
import { scale, moderateScale, fontScale } from "@/utils/ResponsiveUtils";
import * as Clipboard from 'expo-clipboard';

const languages_list = [
  { name: "English", code: "en-US" },
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
  const [sourceLanguage, setSourceLanguage] = useState({ name: "English", code: "en-US" });
  const [targetLanguage, setTargetLanguage] = useState({ name: "Hindi", code: "hi-IN" });
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const inputRef = useRef(null);
  
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

  const playAudio = async (base64String) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const newSound = new Audio.Sound();
      await newSound.loadAsync({ uri: `data:audio/mp3;base64,${base64String}` });
      
      setSound(newSound);
      setIsPlaying(true);
      
      await newSound.playAsync();
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Audio Error", "Could not play the audio. Please try again.");
      setIsPlaying(false);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const apiEndpoint = "https://tts-api-kohl.vercel.app/translate_and_speak";
      const requestBody = {
        text: inputText,
        language: sourceLanguage.code,
        target_language: targetLanguage.name.toLowerCase(),
        voice_model: "arvind", // Default voice model
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        setAudioBase64(result.audio_data);
        setTranslatedText(result.translated_text);
        
        // Play audio automatically after translation
        playAudio(result.audio_data);
        
        // Provide success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error("API Error:", response.status);
        Alert.alert("Translation Error", "Failed to translate text. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Network Error", "Please check your internet connection and try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setInputText("");
    inputRef.current?.focus();
  };

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
                    onPress={isPlaying ? stopAudio : () => playAudio(audioBase64)}
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
