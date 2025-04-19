import { Audio } from "expo-av";
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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
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

  const [data, setData] = useState(languages_list);
  const [search, setSearch] = useState("");
  const searchRef = useRef();

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
      console.log(recording);

      try {
        let form = new FormData();
        // Log the URI and file object
        console.log("Audio URI:", uri);

        const fileToUpload = {
          uri: uri,
          type: "audio/wav",
          name: "recording.wav",
        };
        console.log("File object:", fileToUpload);

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
            // Remove Content-Type to let FormData set it with boundary
          },
          body: form,
        };

        console.log(form);

        console.log("Sending request to Sarvam API...");
        const response = await fetch(
          "https://api.sarvam.ai/speech-to-text",
          options
        );
        console.log("Response status:", response.status);

        // Get response text first
        const responseText = await response.text();
        console.log("Response text:", responseText);

        if (!response.ok) {
          throw new Error(`Server error: ${responseText}`);
        }

        // Parse JSON only if we have valid JSON response
        const data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        setTranscript(data.transcript || ""); // Store transcript
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
    console.log("hello");

    if (recording) {
      setIsProcessing(true);
      try {
        // 1. Stop recording and get transcript
        const transcriptionData = await stopRecording();

        if (transcriptionData && transcriptionData.transcript) {
          // 2. Send transcript for translation
          const apiEndpoint =
            "https://tts-api-kohl.vercel.app/translate_and_speak";
          console.log("IsSelected Language:", IsselectedLanguage);
          console.log("isSelected Language name:", IsselectedLanguage.name);
          console.log("IsSelected Language code:", IsselectedLanguage.code);

          console.log("Selected Language:", selectedLanguage);
          console.log("Selected Language name:", selectedLanguage.name);
          console.log("Selected Language code:", selectedLanguage.code);

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

  const onSearch = (search) => {
    if (search !== "") {
      let tempData = languages_list.filter((item) => {
        return item.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
      });
      setData(tempData);
    } else {
      setData(languages_list);
    }
  };

  return (
    <View style={styles.container}>

      {/* Upper box */}
      <View style={styles.contentBox}>
        <View style={styles.languageBox}>
          <Text style={styles.languageLabel}>
            {selectedLanguage.name || "Select Language"}
          </Text>
        </View>

        <View style={styles.translationBox}>
          <TouchableOpacity
            style={styles.replayButton}
            onPress={async () => {
              console.log("upper Replay pressed!");
              await playBase64Audio(base64String);
            }}
          >
            <Image source={require("./Group.png")} style={styles.replayIcon} />
          </TouchableOpacity>

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

      {/* Language Selector */}
      <View style={styles.languageSelectorContainer}>
        {/* First Language Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setIsClicked(!isClicked)}
          >
            <Text style={styles.selectorText}>
              {selectedLanguage.name === "" ? "Select Language" : selectedLanguage.name}
            </Text>
            <Image
              source={isClicked ? require("./upload.png") : require("./dropdown.png")}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>

          {isClicked && (
            <View style={styles.dropdown}>
              <TextInput
                placeholder="Search.."
                value={search}
                ref={searchRef}
                onChangeText={(txt) => {
                  onSearch(txt);
                  setSearch(txt);
                }}
                style={styles.searchInput}
              />

              <FlatList
                data={data}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                style={styles.dropdownList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedLanguage({ name: item.name, code: item.code });
                      setIsClicked(false);
                      onSearch("");
                      setSearch("");
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <FontAwesome6
          style={styles.switchIcon}
          name="arrow-right-arrow-left"
          size={24}
          color="black"
        />

        {/* Second Language Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setClicked(!Clicked)}
          >
            <Text style={styles.selectorText}>
              {IsselectedLanguage.name === "" ? "Select Language" : IsselectedLanguage.name}
            </Text>
            <Image
              source={Clicked ? require("./upload.png") : require("./dropdown.png")}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>

          {Clicked && (
            <View style={styles.dropdown}>
              <TextInput
                placeholder="Search.."
                value={search}
                ref={searchRef}
                onChangeText={(txt) => {
                  onSearch(txt);
                  setSearch(txt);
                }}
                style={styles.searchInput}
              />

              <FlatList
                data={data}
                style={styles.dropdownList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setIsSelectedLanguage({
                        name: item.name,
                        code: item.code,
                      });
                      setClicked(false);
                      onSearch("");
                      setSearch("");
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </View>

      {/* Lower box */}
      <View style={styles.contentBox}>
        <View style={styles.languageBox}>
          <Text style={styles.languageLabel}>
            {IsselectedLanguage.name || "Select Language"}
          </Text>
        </View>

        <View style={styles.translationBox}>
          <TouchableOpacity
            style={styles.replayButton}
            onPress={async () => {
              alert("Replay pressed!");
              await playBase64Audio(base64String);
            }}
          >
            <Image source={require("./Group.png")} style={styles.replayIcon} />
          </TouchableOpacity>

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

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: "5%",
    paddingTop: 20,
  },
  contentBox: {
    width: "100%",
    minHeight: 220,
    backgroundColor: "#F7F2FA",
    borderColor: "black",
    borderWidth: 1.5,
    borderRadius: 30,
    marginVertical: 12,
    padding: 15,
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
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    zIndex: 999, // Ensure dropdowns appear above other content
  },
  dropdownWrapper: {
    flex: 1,
    maxWidth: "45%",
    position: "relative",
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
    borderColor: "#8e8e8e",
    height: 48,
  },
  selectorText: {
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
  dropdownIcon: {
    width: 14,
    height: 8,
    resizeMode: "contain",
    marginLeft: 5,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 5,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 300,
  },
  searchInput: {
    margin: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  dropdownList: {
    maxHeight: 240,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  dropdownItemText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#333",
  },
  switchIcon: {
    marginHorizontal: 8,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  list: {
    height: 28,
    width: 28,
    resizeMode: "contain",
  }
});