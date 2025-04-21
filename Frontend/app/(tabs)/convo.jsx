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

  // FIX 1: Separate state for each dropdown
  const [selectedLanguage, setSelectedLanguage] = useState({
    name: "",
    code: "",
  });
  const [IsselectedLanguage, setIsSelectedLanguage] = useState({
    name: "",
    code: "",
  });
  const [isClicked, setIsClicked] = useState(false);
  const [Clicked, setClicked] = useState(false);
  
  // FIX 2: Separate data states for each dropdown
  const [data1, setData1] = useState(languages_list);
  const [data2, setData2] = useState(languages_list);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const searchRef1 = useRef();
  const searchRef2 = useRef();

  const translateAndSpeak = async (transcriptText) => {
    if (!transcriptText) {
      console.error("No transcript to translate");
      return;
    }

    try {
      const apiEndpoint = "https://tts-api-kohl.vercel.app/translate_and_speak";
      const requestBody = {
        text: transcriptText,
        language: IsselectedLanguage.code || "hi-IN",
        target_language: IsselectedLanguage.name?.toLowerCase() || "telugu",
        voice_model: "arvind",
      };

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
        form.append(
          "language_code",
          !isUp
            ? IsselectedLanguage.code === ""
              ? "hi-IN"
              : IsselectedLanguage.code
            : selectedLanguage.code === ""
            ? "hi-IN"
            : selectedLanguage.code
        );
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
    if (recording) {
      setIsProcessing(true);
      try {
        // 1. Stop recording and get transcript
        const transcriptionData = await stopRecording();

        if (transcriptionData && transcriptionData.transcript) {
          // 2. Send transcript for translation
          const apiEndpoint =
            "https://tts-api-kohl.vercel.app/translate_and_speak";

          const requestBody = {
            text: transcriptionData.transcript,
            language: !isUp
              ? IsselectedLanguage.code === ""
                ? "hi-IN"
                : IsselectedLanguage.code
              : selectedLanguage.code === ""
              ? "hi-IN"
              : selectedLanguage.code,
            target_language: !isUp
              ? selectedLanguage.name.toLowerCase() === ""
                ? "telugu"
                : selectedLanguage.name.toLowerCase()
              : IsselectedLanguage.name.toLowerCase() === ""
              ? "telugu"
              : IsselectedLanguage.name.toLowerCase(),
            voice_model: "arvind",
          };

          // 3. Make translation request
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          // 4. Handle translation response and play audio
          if (response.ok) {
            const audioUrl = await response.text();
            const jsonObject = JSON.parse(audioUrl);
            setBase64String(jsonObject.audio_data);
            setTranslatedText(jsonObject.translated_text);
            await playBase64Audio(jsonObject.audio_data);
          }
        }
      } catch (error) {
        console.error("Recording process error:", error);
        Alert.alert("Error", "Failed to process recording");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start new recording
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
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.innerContainer}
        onPress={handleOutsideClick}
      >
        {/* Upper box */}
        <View style={styles.contentBox}>
          <View style={styles.languageBox}>
            <Text style={styles.languageLabel}>
              {selectedLanguage.name || "Select Language"}
            </Text>
          </View>

          <View style={styles.translationBox}>
            {base64String && (
              <TouchableOpacity
                style={styles.replayButton}
                onPress={async () => {
                  await playBase64Audio(base64String);
                }}
              >
                <Image source={require("./Group.png")} style={styles.replayIcon} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                setTranscript("");
                setTranslatedText("");
                setIsUp(true);
                handleRecordingProcess();
              }}
              style={[styles.mic, isProcessing && styles.disabledMic]}
              disabled={isProcessing}
            >
              <Image source={require("./monogram.png")} style={styles.micIcon} />
              {isProcessing && <ActivityIndicator size="small" color="#000" />}
            </TouchableOpacity>

            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>
                {isUp ? transcript || "Speak to see transcription" : "Speak to see transcription"}
              </Text>
              {!isUp && translatedText ? (
                <View style={styles.translatedTextContainer}>
                  <Text style={styles.translatedTextStyle}>{translatedText}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Enhanced Language Selector */}
        {/* <View style={styles.languageSelectorContainer}> */}
          {/* First Language Dropdown */}
          {/* <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={[
                styles.dropdownSelector,
                isClicked && styles.activeDropdownSelector
              ]}
              onPress={() => {
                // Provide feedback
                Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
                setIsClicked(!isClicked);
                // Close the other dropdown if open
                if (Clicked) setClicked(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.selectorContent}>
                <Text style={styles.selectorLabel}>From</Text>
                
                <Text style={selectedLanguage.name===""?styles.placeholderText:styles.selectorText}>

                  {IsselectedLanguage.name || "Select Language"}
                </Text>
              </View>
              <FontAwesome6
                name={isClicked ? "chevron-up" : "chevron-down"}
                size={16}
                color="#555"
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>

            {isClicked && (
              <View style={styles.dropdown}>
                <View style={styles.searchWrapper}>
                  <FontAwesome6 name="search" size={16} color="#777" style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search languages..."
                    value={search1}
                    ref={searchRef1}
                    onChangeText={(txt) => {
                      onSearch1(txt);
                      setSearch1(txt);
                    }}
                    style={styles.searchInput}
                    placeholderTextColor="#999"
                  />
                  {search1.length > 0 && (
                    <TouchableOpacity 
                      onPress={() => {
                        setSearch1("");
                        onSearch1("");
                      }}
                      style={styles.clearSearch}
                    >
                      <FontAwesome6 name="times-circle" size={16} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                <FlatList
                  data={data1}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  style={styles.dropdownList}
                  keyExtractor={(item, index) => `lang1-${index}`}
                  contentContainerStyle={styles.dropdownListContent}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        selectedLanguage.code === item.code && styles.selectedDropdownItem
                      ]}
                      onPress={() => {
                        // Provide feedback
                        Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Light);
                        setSelectedLanguage({ name: item.name, code: item.code });
                        setIsClicked(false);
                        onSearch1("");
                        setSearch1("");
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedLanguage.code === item.code && styles.selectedDropdownItemText
                      ]}>
                        {item.name}
                      </Text>
                      {selectedLanguage.code === item.code && (
                        <FontAwesome6 name="check" size={16} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                      <Text style={styles.emptyListText}>No languages found</Text>
                    </View>
                  }
                />
              </View>
            )}
          </View> */}
          <View style={styles.languageSelectionContainer}>
            <View style={styles.languageSelectorRow}>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
                options={languages_list}
                label="From"
                style={styles.languageSelector}
              />
               <TouchableOpacity
            onPress={() => {
              // Swap languages
              const temp = selectedLanguage;
              setSelectedLanguage(IsselectedLanguage);
              setIsSelectedLanguage(temp);
              // Provide feedback
              Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
            }}
            style={styles.switchButton}
          >
            <FontAwesome6
              name="arrow-right-arrow-left"
              size={18}
              color="#444"
            />
          </TouchableOpacity>
              
              <LanguageSelector
                selectedLanguage={IsselectedLanguage}
                onSelectLanguage={setIsSelectedLanguage}
                options={languages_list}
                label="To"
                style={styles.languageSelector}
              />
            </View>
          </View>
          

          {/* <TouchableOpacity
            onPress={() => {
              // Swap languages
              const temp = selectedLanguage;
              setSelectedLanguage(IsselectedLanguage);
              setIsSelectedLanguage(temp);
              // Provide feedback
              Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
            }}
            style={styles.switchButton}
          >
            <FontAwesome6
              name="arrow-right-arrow-left"
              size={18}
              color="#444"
            />
          </TouchableOpacity> */}

          {/* Second Language Dropdown */}
          {/* <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={[
                styles.dropdownSelector,
                Clicked && styles.activeDropdownSelector
              ]}
              onPress={() => {
                // Provide feedback
                Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Medium);
                setClicked(!Clicked);
                // Close the other dropdown if open
                if (isClicked) setIsClicked(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.selectorContent}>
                <Text style={styles.selectorLabel}>To</Text>
                <Text style={selectedLanguage.name===""?styles.placeholderText:styles.selectorText}>
                  {selectedLanguage.name || "Select Language"}
                </Text>
              </View>
              <FontAwesome6
                name={Clicked ? "chevron-up" : "chevron-down"}
                size={16}
                color="#555"
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>

            {Clicked && (
              <View style={styles.dropdown}>
                <View style={styles.searchWrapper}>
                  <FontAwesome6 name="search" size={16} color="#777" style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search languages..."
                    value={search2}
                    ref={searchRef2}
                    onChangeText={(txt) => {
                      onSearch2(txt);
                      setSearch2(txt);
                    }}
                    style={styles.searchInput}
                    placeholderTextColor="#999"
                  />
                  {search2.length > 0 && (
                    <TouchableOpacity 
                      onPress={() => {
                        setSearch2("");
                        onSearch2("");
                      }}
                      style={styles.clearSearch}
                    >
                      <FontAwesome6 name="times-circle" size={16} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                <FlatList
                  data={data2}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  style={styles.dropdownList}
                  keyExtractor={(item, index) => `lang2-${index}`}
                  contentContainerStyle={styles.dropdownListContent}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        IsselectedLanguage.code === item.code && styles.selectedDropdownItem
                      ]}
                      onPress={() => {
                        // Provide feedback
                        Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Light);
                        setIsSelectedLanguage({ name: item.name, code: item.code });
                        setClicked(false);
                        onSearch2("");
                        setSearch2("");
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        IsselectedLanguage.code === item.code && styles.selectedDropdownItemText
                      ]}>
                        {item.name}
                      </Text>
                      {IsselectedLanguage.code === item.code && (
                        <FontAwesome6 name="check" size={16} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                      <Text style={styles.emptyListText}>No languages found</Text>
                    </View>
                  }
                />
              </View>
            )}
          </View> */}
        {/* </View> */}

        {/* Lower box */}
        <View style={styles.contentBox}>
          <View style={styles.languageBox}>
            <Text style={styles.languageLabel}>
              {IsselectedLanguage.name || "Select Language "}
            </Text>
          </View>

          <View style={styles.translationBox}>
            {base64String && (
              <TouchableOpacity
                style={styles.replayButton}
                onPress={async () => {
                  await playBase64Audio(base64String);
                }}
              >
                <Image source={require("./Group.png")} style={styles.replayIcon} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.mic, isProcessing && styles.disabledMic]}
              disabled={isProcessing}
              onPress={() => {
                setTranscript("");
                setTranslatedText("");
                setIsUp(false);
                handleRecordingProcess();
              }}
            >
              <Image source={require("./monogram.png")} style={styles.micIcon} />
              {isProcessing && <ActivityIndicator size="small" color="#000" />}
            </TouchableOpacity>

            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>
                {!isUp ? transcript || "Speak to see transcription" : "Speak to see transcription"}
              </Text>
              {isUp && translatedText ? (
                <View style={styles.translatedTextContainer}>
                  <Text style={styles.translatedTextStyle}>{translatedText}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: 20,
  },
  contentBox: {
    width: "100%",
    minHeight: 200,
    backgroundColor: "#F7F2FA",
    borderColor: "black",
    borderWidth: 1.5,
    borderRadius: 30,
    marginVertical: 12,
    padding: 10,
    position: "relative",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  languageBox: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  translationBox: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 10,
  },
  replayButton: {
    position: "absolute",
    top: 0,
    right: 10,
    zIndex: 2,
    padding: 8,
  },
  replayIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  mic: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginVertical: 15,
  },
  micIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  disabledMic: {
    opacity: 0.5,
  },
  transcriptContainer: {
    width: "90%",
    minHeight: 80,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  transcriptText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
  },
  translatedTextContainer: {
    width: "100%",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  translatedTextStyle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  loadingText: {
    marginTop: 8,
    color: '#0000ff',
    fontSize: 16,
  },
  
  // Enhanced language selector styles
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    position: "relative",
    zIndex: 5000,
  },
  dropdownWrapper: {
    flex: 1,
    maxWidth: "45%",
    position: "relative",
    zIndex: 5001,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1d1d1",
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDropdownSelector: {
    borderColor: "#6a5ae0",
    shadowColor: "#6a5ae0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  selectorLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
    fontWeight: "500",
  },
  placeholderText: {
    fontWeight: "600",
    fontSize: 12,
    color: "#333",
  },
  selectorText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  // switchButton: {
  //   backgroundColor: "#f5f5f5",
  //   width: 44,
  //   height: 44,
  //   borderRadius: 22,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 1 },
  // },
  dropdownItemText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#333",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  loadingText: {
    marginTop: 8,
    color: '#0000ff',
    fontSize: 16,
  },
  selectorContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: "#777",
  },
  activeDropdownSelector: {
    borderColor: "#4CAF50",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  clearSearch: {
    marginLeft: 8,
  },
  dropdownListContent: {
    paddingBottom: 10,
  },
  selectedDropdownItem: {
    backgroundColor: "#f0f0f0",
  },
  selectedDropdownItemText: {
    color: "#4CAF50",
  },
  emptyListContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyListText: {
    color: "#999",
    fontSize: 14,
  },
  // Enhanced language selector styles
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    position: "relative",
    zIndex: 5000, // Higher z-index to ensure dropdowns show above other elements
  },
  dropdownWrapper: {
    flex: 1,
    maxWidth: "45%",
    position: "relative",
    zIndex: 5001, // Higher than container
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1d1d1",
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDropdownSelector: {
    borderColor: "#6a5ae0",
    shadowColor: "#6a5ae0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  selectorLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
    fontWeight: "500",
  },
  // selectorText: {
  //   fontWeight: "600",
  //   fontSize: 16,
  //   color: "#333",
  // },
  dropdownIcon: {
    marginLeft: 8,
  },
  switchButton: {
    backgroundColor: "#f5f5f5",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginHorizontal: 8,
    marginVertical: 10,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 5,
    zIndex: 5002, // Higher than wrapper
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 320, // Fixed maximum height
    overflow: "hidden",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  clearSearch: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 250, // Fixed height to enable scrolling
  },
  dropdownListContent: {
    paddingBottom: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  selectedDropdownItem: {
    backgroundColor: "rgba(106, 90, 224, 0.05)",
  },
  dropdownItemText: {
    fontWeight: "500",
    fontSize: 15,
    color: "#333",
  },
  selectedDropdownItemText: {
    color: "#6a5ae0",
    fontWeight: "600",
  },
  emptyListContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyListText: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
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
});