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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import axios from 'axios';

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
            ? IsselectedLanguage["code"] === ""
              ? "hi-IN"
              : IsselectedLanguage["code"]
            : selectedLanguage["code"] === ""
            ? "hi-IN"
            : selectedLanguage["code"]
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
          console.log("isSelected Language name:", IsselectedLanguage["name"]);
          console.log("IsSelected Language code:", IsselectedLanguage["code"]);

          console.log("Selected Language:", selectedLanguage);
          console.log("Selected Language name:", selectedLanguage["name"]);
          console.log("Selected Language code:", selectedLanguage["code"]);

          const requestBody = {
            text: transcriptionData.transcript,
            language: !isUp
              ? IsselectedLanguage["code"] === ""
                ? "hi-IN"
                : IsselectedLanguage["code"]
              : selectedLanguage["code"] === ""
              ? "hi-IN"
              : selectedLanguage["code"],
            target_language: !isUp
              ? selectedLanguage["name"].toLowerCase() === ""
                ? "telugu"
                : selectedLanguage["name"].toLowerCase()
              : IsselectedLanguage["name"].toLowerCase() === ""
              ? "telugu"
              : IsselectedLanguage["name"].toLowerCase(),
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
            setBase64String(jsonObject["audio_data"]);
            setTranslatedText(jsonObject["translated_text"]);
            await playBase64Audio(jsonObject["audio_data"]);
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
  const onSearch = (search) => {
    if (search !== "") {
      let tempData = data.filter((item) => {
        return item.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
      });
      setData(tempData);
    } else {
      setData(languages_list);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Conversation</Text>
        <Image
          source={require("../list.png")}
          style={styles.list}
          onPress={() => alert("list pressed!")}
        />
      </View>
      {/* Lower box  */}
      <View style={styles.content}>
        <View style={styles.box}>
          <View>
            <Text style={{ bottom: 50, right: 100, fontSize: 15 }}>
              {IsselectedLanguage.name}
            </Text>
          </View>

          <TouchableOpacity
            onPress={async () => {
              alert("Replay pressed!");
              await playBase64Audio(base64String);
            }}
          >
            <Image
              source={require("./Group.png")}
              style={{ bottom: 80, right: 20 }}
            />
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
            <Image source={require("./monogram.png")} />
          </TouchableOpacity>
          {/*isPlaying ? (
            <TouchableOpacity style={styles.mic} onPress={stopBase64Audio}>
              <Image source={require("./monogram.png")} />
            </TouchableOpacity>
          ) : undefined*/}
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptText}>
              {!isUp
                ? transcript || "Speak to see transcription"
                : "Speak to see transcription"}
              {isUp
                ? translatedText && (
                    <View style={styles.translatedTextContainer}>
                      <Text style={styles.translatedTextStyle}>
                        {translatedText}
                      </Text>
                    </View>
                  )
                : undefined}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.dropdowncontainer}>
        <TouchableOpacity
          style={styles.dropdownselector}
          onPress={() => {
            setIsClicked(!isClicked);
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {selectedLanguage.name === ""
              ? "Select Language"
              : selectedLanguage.name}
          </Text>
          {isClicked ? (
            <Image source={require("./upload.png")} style={styles.Image} />
          ) : (
            <Image source={require("./dropdown.png")} style={styles.Image} />
          )}
        </TouchableOpacity>
        {isClicked ? (
          <View
            style={{
              elevation: 5,
              marginTop: 5,
              maxHeight: 300, // Changed from fixed height
              width: "40%",
              backgroundColor: "#fff",
              borderRadius: 10,
              zIndex: 1000,
              alignSelf: 'flex-start',
              marginLeft: 20,
              
            }}
          >
            <TextInput
              placeholder="Search.."
              value={search}
              ref={searchRef}
              onChangeText={(txt) => {
                onSearch(txt);
                setSearch(txt);
              }}
              style={{
                width: "90%",
                height: 40,
                margin: 10,
                borderWidth: 0.2,
                borderRadius: 7,
                paddingLeft: 10
              }}
            />

            <FlatList
              data={data}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              style={{
                maxHeight: 240 // Leave room for TextInput
              }}
              contentContainerStyle={{
                paddingBottom: 10
              }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{
                    width: "100%",
                    minHeight: 40,
                    borderBottomWidth: 0.5,
                    borderColor: "#8e8e8e",
                    padding: 10
                  }}
                  onPress={() => {
                    setSelectedLanguage({ name: item.name, code: item.code });
                    setIsClicked(!isClicked);
                    onSearch("");
                    setSearch("");
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}

        <FontAwesome6
          style={styles.Icon}
          name="arrow-right-arrow-left"
          size={24}
          color="black"
        />

        <TouchableOpacity
          style={styles.dropdownselector}
          onPress={() => {
            setClicked(!Clicked);
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {IsselectedLanguage.name === ""
              ? "Select Language"
              : IsselectedLanguage.name}
          </Text>
          {Clicked ? (
            <Image source={require("./upload.png")} style={styles.Image} />
          ) : (
            <Image source={require("./dropdown.png")} style={styles.Image} />
          )}
        </TouchableOpacity>
        {Clicked ? (
          <View
            style={{
              elevation: 5,
              marginTop: 5,
              height: 300,
              position: "relative",
              top: 300,
              right: 155,
              width: "40%",
              backgroundColor: "#fff",
              borderRadius: 10,
            }}
          >
            <TextInput
              placeholder="Search.."
              value={search}
              ref={searchRef}
              onChangeText={(txt) => {
                onSearch(txt);
                setSearch(txt);
              }}
              style={{
                width: "100%",
                height: 40,
                borderWidth: 0.2,
                borderColor: "#8e8e8e",
                borderRadius: 7,
                marginTop: 10,
                paddingLeft: 20,
                marginBottom: 10,
              }}
            />
            <FlatList
              data={data}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      height: 40,
                      borderBottomWidth: 0.5,
                      borderColor: "#8e8e8e",
                    }}
                    onPress={() => {
                      setIsSelectedLanguage({
                        name: item.name,
                        code: item.code,
                      });
                      setClicked(!Clicked);
                      onSearch("");
                      setSearch("");
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        ) : null}
      </View>
      {/* Upper box  */}
      <View style={styles.content_2}>
        <View style={styles.box_2}>
          <View>
            <Text style={{ bottom: 50, right: 100, fontSize: 15 }}>
              {selectedLanguage.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              console.log("upper Replay pressed!");
              await playBase64Audio(base64String);
            }}
          >
            <Image
              source={require("./Group.png")}
              style={{ bottom: 80, right: 20 }}
            />
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
            <Image source={require("./monogram.png")} />
            {isProcessing && <ActivityIndicator size="small" color="#000" />}
          </TouchableOpacity>

          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptText}>
              {isUp
                ? transcript || "Speak to see transcription"
                : "Speak to see transcription"}
              {!isUp
                ? translatedText && (
                    <View style={styles.translatedTextContainer}>
                      <Text style={styles.translatedTextStyle}>
                        {translatedText}
                      </Text>
                    </View>
                  )
                : undefined}
            </Text>
          </View>

          {error && <Text style={{ color: "red" }}>{error}</Text>}
        </View>
      </View>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: "#007AF5",
    paddingTop: 30,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    height: 90,
    justifyContent: "center",
    paddingLeft: 70,
    width: "100%",
  },

  headerText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    top: 15,
    right: 10,
  },
  content_2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    top: 320,
    transform: [{ rotate: "180deg" }],
  },
  box_2: {
    width: "95%",
    height: 250,
    backgroundColor: "#F7F2FA",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
    top: 530,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    top: 320,
    marginTop: 50,
  },
  box: {
    width: "95%",
    height: 250,
    backgroundColor: "#F7F2FA",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
    top: 160,
  },
  label_input: {
    width: "100%",
    fontSize: 20,
    height: 160,
    backgroundColor: "white",
    borderRadius: 40,
    paddingBottom: 60,
    paddingLeft: 50,
  },
  boxText: {
    color: "#000",
    fontSize: 18,
  },

  item: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 1,
  },
  title: {
    fontSize: 24,
  },
  dropdownselector: {
    paddingTop: 6,
    width: "45%",
    height: 40,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#8e8e8e",
    marginTop: 260,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  Image: {
    width: 15,
    height: 10,
    paddingTop: 25,
  },
  dropdownArea: {
    width: "40%",
    height: 300,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 5,
  },
  dropdowncontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    padding: 0,
  },
  Icon: {
    paddingTop: 270,
  },

  mic: {
    top: 30,
  },
  button: {
    backgroundColor: "#FF6600",
    padding: 5,
    borderRadius: 40,
    height: 50,
    width: 140,
    bottom: 5,
    left: 100,
  },
  buttonText: {
    color: "white",
    fontSize: 23,
    left: 20,
  },
  list: {
    height: 30,
    width: 30,
    right: 50,
    bottom: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  transcriptContainer: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    transform: [{ translateY: -30 }],
  },
  transcriptText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  translatedTextContainer: {
    position: "absolute",
    top: 70,
    width: "80%",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
  },
  translatedTextStyle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  disabledMic: {
    opacity: 0.5,
  },
});
