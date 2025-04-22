import { Audio } from "expo-av";
import * as Haptics from 'expo-haptics'; // Add this import if you want haptic feedback
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { scale} from "@/utils/ResponsiveUtils";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from "@/constants/Theme";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const { width, height } = Dimensions.get("window");

export default function Convo() {
  const [isUp, setIsUp] = useState(false);
  const [base64String, setBase64String] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playBase64Audio = async (base64String) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const newSound = new Audio.Sound();
      await newSound.loadAsync(
        { uri: `data:audio/mp3;base64,${base64String}` },
        {},
        true
      );
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const stopBase64Audio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  const languages_list = [
    { name: "Hindi", code: "hi-IN", apiCode: "Hindi" },
    { name: "Telugu", code: "te-IN", apiCode: "Telugu" },
    { name: "Punjabi", code: "pa-IN", apiCode: "Punjabi" },
    { name: "Tamil", code: "ta-IN", apiCode: "Tamil" },
    { name: "Kannada", code: "kn-IN", apiCode: "Kannada" },
    { name: "Bengali", code: "bn-IN", apiCode: "Bengali" },
    { name: "Gujarati", code: "gu-IN", apiCode: "Gujarati" },
    { name: "Marathi", code: "mr-IN", apiCode: "Marathi" },
    { name: "Malayalam", code: "ml-IN", apiCode: "Malayalam" },
    { name: "Odia", code: "od-IN", apiCode: "Odia" },
  ];

  // Set default languages
  const [selectedLanguage, setSelectedLanguage] = useState(languages_list[0]);
  const [IsselectedLanguage, setIsSelectedLanguage] = useState(languages_list[1]);

  // Language validation helper
  const validateLanguageSelection = () => {
    if (!selectedLanguage.code || !IsselectedLanguage.code) {
      Alert.alert("Language Selection", "Please select languages for both persons");
      return false;
    }
    return true;
  };

  // Updated helper functions for language management
  const getSourceLanguage = (isSpeakerA) => {
    const speaker = isSpeakerA ? selectedLanguage : IsselectedLanguage;
    return speaker.code || "hi-IN";
  };

  const getTargetLanguage = (isSpeakerA) => {
    const listener = isSpeakerA ? IsselectedLanguage : selectedLanguage;
    return listener.apiCode || "hindi";
  };

  const getDefaultVoiceModel = (targetLang) => {
    // Map target languages to appropriate voice models
    const voiceModels = {
      hindi: "meera",
      telugu: "meera",
      tamil: "meera",
      // Add more language-specific voice models as needed
    };
    return voiceModels[targetLang] || "meera";
  };

  const createTranslationRequest = (text, isSpeakerA) => {
    if (!validateLanguageSelection()) return null;
    
    return {
      text: text,
      language: getSourceLanguage(isSpeakerA),
      target_language: getTargetLanguage(isSpeakerA),
      voice_model: getDefaultVoiceModel(getTargetLanguage(isSpeakerA))
    };
  };

  const translateAndSpeak = async (transcriptText) => {
    if (!transcriptText) {
      console.error("No transcript to translate");
      return;
    }

    try {
      const apiEndpoint = "https://tts-api-id9n.vercel.app/translate_and_speak";
      const requestBody = createTranslationRequest(transcriptText, !isUp);

      setIsLoading(true);
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        setBase64String(jsonResponse.audio_data);
        setTranslatedText(jsonResponse.translated_text);
        await playBase64Audio(jsonResponse.audio_data);
      }
    } catch (error) {
      console.error("Translation error:", error);
      Alert.alert("Error", "Translation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WAVE,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      setError(err.message);
    }
  };

  const stopRecording = async () => {
    setIsProcessing(true);
    try {
      console.log("Stopping recording..");
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      try {
        let form = new FormData();
        
        const fileToUpload = {
          uri: uri,
          type: "audio/wav",
          name: "recording.wav",
        };

        form.append("file", fileToUpload);
        form.append("language_code", getSourceLanguage(isUp));
        form.append("model", "saarika:v1");

        const options = {
          method: "POST",
          headers: {
            "api-subscription-key": "7681997b-fff6-4626-8791-9fef034d19d2",
            Accept: "application/json",
          },
          body: form,
        };

        console.log("Sending request to Sarvam API...");
        const response = await fetch(
          "https://api.sarvam.ai/speech-to-text",
          options
        );
        console.log("Response status:", response.status);

        const responseText = await response.text();
        console.log("Response text:", responseText);

        if (!response.ok) {
          throw new Error(`Server error: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        setTranscript(data.transcript || "");
        return data;
      } catch (error) {
        console.error("Transcription error:", error);
        setError(`Failed to transcribe: ${error.message}`);
        setTranscript("Error transcribing audio");
        throw error;
      }
    } catch (error) {
      console.error("Error in stopRecording:", error);
    } finally {
      setIsProcessing(false);
    }
    return false;
  };

  const handleRecordingProcess = async () => {
    if (!validateLanguageSelection()) return;

    if (recording) {
      setIsProcessing(true);
      try {
        const transcriptionData = await stopRecording();

        if (transcriptionData && transcriptionData.transcript) {
          const apiEndpoint = "https://tts-api-id9n.vercel.app/translate_and_speak";
          
          // Create request body based on who is speaking
          const requestBody = createTranslationRequest(
            transcriptionData.transcript,
            isUp // true for Person A, false for Person B
          );

          if (!requestBody) return;

          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const jsonResponse = await response.json();
            setBase64String(jsonResponse.audio_data);
            setTranslatedText(jsonResponse.translated_text);
            await playBase64Audio(jsonResponse.audio_data);
          }
        }
      } catch (error) {
        console.error("Recording process error:", error);
        Alert.alert("Error", "Failed to process recording");
      } finally {
        setIsProcessing(false);
      }
    } else {
      await startRecording();
    }
  };

  // FIX 3: Separate search functions for each dropdown
  const onSearch1 = (search) => {
    if (search !== "") {
      let tempData = languages_list.filter((item) => {
        return item.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
      });
      setData1(tempData);
    } else {
      setData1(languages_list);
    }
  };

  const onSearch2 = (search) => {
    if (search !== "") {
      let tempData = languages_list.filter((item) => {
        return item.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
      });
      setData2(tempData);
    } else {
      setData2(languages_list);
    }
  };

  // Close dropdowns when clicking outside
  const handleOutsideClick = () => {
    if (isClicked) setIsClicked(false);
    if (Clicked) setClicked(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Person A's Box */}
        <View style={styles.personSection}>
          <View style={[styles.personBox, styles.personABox]}>
            <View style={styles.personHeader}>
              <MaterialIcons name="person" size={24} color="#0000FF" />
              <Text style={styles.personLabel}>Person A</Text>
              <Text style={styles.personLanguage}>
                {selectedLanguage.name || "Select Language"}
              </Text>
            </View>
            
            <View style={styles.contentArea}>
              <View style={styles.transcriptArea}>
                <Text style={styles.transcriptText}>
                  {isUp ? transcript : "Tap mic to speak"}
                </Text>
                {!isUp && translatedText && (
                  <View style={styles.translationBubble}>
                    <Text style={styles.translatedText}>{translatedText}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.controlsArea}>
                {base64String && !isUp && (
                  <TouchableOpacity
                    style={styles.replayButton}
                    onPress={() => playBase64Audio(base64String)}
                  >
                    <MaterialIcons name="replay" size={24} color="#0000FF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setTranscript("");
                    setTranslatedText("");
                    setIsUp(true);
                    handleRecordingProcess();
                  }}
                  style={[
                    styles.micButton,
                    isProcessing && styles.disabledMic,
                    isUp && styles.activeMic
                  ]}
                  disabled={isProcessing}
                >
                  <MaterialIcons 
                    name={isProcessing ? "hourglass-empty" : "mic"} 
                    size={28} 
                    color={isUp ? "#fff" : "#0000FF"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Language Selection Section */}
        <View style={styles.languageSelectionContainer}>
          <View style={styles.languageSelectorRow}>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              options={languages_list}
              label="Person A"
              style={styles.languageSelector}
            />
            <TouchableOpacity
              onPress={() => {
                const temp = selectedLanguage;
                setSelectedLanguage(IsselectedLanguage);
                setIsSelectedLanguage(temp);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={styles.switchButton}
            >
              <MaterialIcons name="swap-vert" size={24} color="#0000FF" />
            </TouchableOpacity>
            <LanguageSelector
              selectedLanguage={IsselectedLanguage}
              onSelectLanguage={setIsSelectedLanguage}
              options={languages_list}
              label="Person B"
              style={styles.languageSelector}
            />
          </View>
        </View>

        {/* Person B's Box */}
        <View style={styles.personSection}>
          <View style={[styles.personBox, styles.personBBox]}>
            <View style={styles.personHeader}>
              <MaterialIcons name="person" size={24} color="#0000FF" />
              <Text style={styles.personLabel}>Person B</Text>
              <Text style={styles.personLanguage}>
                {IsselectedLanguage.name || "Select Language"}
              </Text>
            </View>
            
            <View style={styles.contentArea}>
              <View style={styles.transcriptArea}>
                <Text style={styles.transcriptText}>
                  {!isUp ? transcript : "Tap mic to speak"}
                </Text>
                {isUp && translatedText && (
                  <View style={styles.translationBubble}>
                    <Text style={styles.translatedText}>{translatedText}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.controlsArea}>
                {base64String && isUp && (
                  <TouchableOpacity
                    style={styles.replayButton}
                    onPress={() => playBase64Audio(base64String)}
                  >
                    <MaterialIcons name="replay" size={24} color="#0000FF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setTranscript("");
                    setTranslatedText("");
                    setIsUp(false);
                    handleRecordingProcess();
                  }}
                  style={[
                    styles.micButton,
                    isProcessing && styles.disabledMic,
                    !isUp && styles.activeMic
                  ]}
                  disabled={isProcessing}
                >
                  <MaterialIcons 
                    name={isProcessing ? "hourglass-empty" : "mic"} 
                    size={28} 
                    color={!isUp ? "#fff" : "#0000FF"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: scale(16),
  },
  header: {
    paddingVertical: scale(12),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: scale(16),
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#2c3e50',
  },
  languageSelectionContainer: {
    marginVertical: scale(16),
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  languageSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(8),
  },
  languageSelector: {
    flex: 1,
  },
  switchButton: {
    backgroundColor: '#fff',
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#0000FF',
  },
  conversationContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap: scale(16),
  },
  personSection: {
    flex: 1,
  },
  personBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  personABox: {
    borderColor: '#0000FF',
    borderWidth: 1,
  },
  personBBox: {
    borderColor: '#0000FF',
    borderWidth: 1,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: scale(8),
  },
  personLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#2c3e50',
  },
  personLanguage: {
    fontSize: scale(14),
    color: '#0000FF',
    marginLeft: 'auto',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: scale(12),
  },
  transcriptArea: {
    flex: 1,
    padding: scale(12),
  },
  transcriptText: {
    fontSize: scale(16),
    color: '#2c3e50',
    marginBottom: scale(8),
  },
  translationBubble: {
    backgroundColor: '#f0eeff',
    borderRadius: scale(12),
    padding: scale(12),
    marginTop: scale(8),
    borderWidth: 1,
    borderColor: '#e6e3ff',
  },
  translatedText: {
    fontSize: scale(14),
    color: '#0000FF',
    lineHeight: scale(20),
  },
  controlsArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scale(12),
    gap: scale(16),
  },
  micButton: {
    backgroundColor: '#fff',
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#0000FF',
  },
  activeMic: {
    backgroundColor: '#0000FF',
  },
  disabledMic: {
    opacity: 0.7,
  },
  replayButton: {
    backgroundColor: '#fff',
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorContainer: {
    position: 'absolute',
    bottom: scale(20),
    left: scale(16),
    right: scale(16),
    backgroundColor: '#ffebee',
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: scale(14),
  },
});