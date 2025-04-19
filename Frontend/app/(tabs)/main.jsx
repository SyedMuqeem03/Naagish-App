// this is translation page
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Audio } from "expo-av";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FontAwesome5 } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useFonts } from "expo-font";
import { widthScale, heightScale, fontScale, getResponsivePadding } from "../components/ResponsiveUtils";

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

export default function translation() {
  const [text, setText] = useState("");
  const [base64String, setBase64String] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sound = new Audio.Sound();
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions({ width: window.width, height: window.height });
      }
    );
    return () => subscription.remove();
  }, []);

  const playBase64Audio = async (base64String) => {
    try {
      await sound.unloadAsync();
      await sound.loadAsync(
        { uri: `data:audio/mp3;base64,${base64String}` },
        {},
        true
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const stopBase64Audio = async () => {
    try {
      if (sound._loaded) {
        await sound.stopAsync();
        await sound.unloadAsync();
      } else {
        alert("sound not loaded");
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  const translateAndSpeak = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Please enter text to translate");
      return;
    }

    if (!IsselectedLanguage) {
      Alert.alert("Error", "Please select a target language");
      return;
    }

    setIsLoading(true);
    const apiEndpoint = "https://tts-api-kohl.vercel.app/translate_and_speak";
    const requestBody = {
      text: text,
      language: "hi-IN",
      target_language:
        IsselectedLanguage.toLowerCase() === ""
          ? "hindi"
          : IsselectedLanguage.toLowerCase(),
      voice_model: "arvind",
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const audioUrl = await response.text();
        const jsonObject = JSON.parse(audioUrl);
        setBase64String(jsonObject["audio_data"]);
        setTranslatedText(jsonObject["translated_text"]);
        playBase64Audio(jsonObject["audio_data"]);
        Alert.alert("Success", "Translation and speech processed!");
      } else {
        console.error("API Error:", response.status);
        Alert.alert("Error", "Failed to process translation and speech.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleButtonPress = () => {
    alert(`Input Value: ${text}`);
  };

  const languages_list = [
    { name: "Hindi", code: "hindi" },
    { name: "Telugu", code: "telugu" },
    { name: "Punjabi", code: "punjabi" },
    { name: "Tamil", code: "tamil" },
    { name: "Kannada", code: "kn-IN" },
    { name: "Bengali", code: "bn-IN" },
    { name: "Gujarati", code: "gu-IN" },
    { name: "Marathi", code: "mr-IN" },
    { name: "Malayalam", code: "ml-IN" },
    { name: "Odia", code: "od-IN" },
  ];
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [IsselectedLanguage, setIsSelectedLanguage] = useState("");

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

  // Add dynamic styles for dimension-dependent components
  const getDynamicStyles = () => {
    return {
      contentContainer: {
        backgroundColor: "#fff",
        marginHorizontal: widthScale(15),
        marginTop: heightScale(15),
        marginBottom: heightScale(15),
        paddingHorizontal: widthScale(10),
        paddingVertical: heightScale(15),
        justifyContent: "space-between",
        height: heightScale(400),
      },
      dropdownArea: {
        position: "absolute",
        top: heightScale(150),
        left: widthScale(20),
        right: widthScale(20),
        maxHeight: heightScale(250),
        borderRadius: widthScale(10),
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "#000",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
      }
    };
  };

  return (
    <View style={styles.container}>

      {/* Language Selection */}
      <View style={styles.languageSelectionContainer}>
        <View style={styles.languageSelectorWrapper}>
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={() => {
              setIsClicked(!isClicked);
            }}
          >
            <Text style={styles.languageSelectorText}>
              {selectedLanguage == "" ? "English" : selectedLanguage}
            </Text>
            <Text style={styles.dashText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.arrowContainer}>
          <FontAwesome6
            name="arrow-right-arrow-left"
            size={18}
            color="#007AF5"
          />
        </View>

        <View style={styles.languageSelectorWrapper}>
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={() => {
              setClicked(!Clicked);
            }}
          >
            <Text style={styles.languageSelectorText}>
              {IsselectedLanguage == "" ? "Hindi" : IsselectedLanguage}
            </Text>
            <Text style={styles.dashText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Dropdown */}
      {isClicked && (
        <View style={getDynamicStyles().dropdownArea}>
          <TextInput
            placeholder="Search languages..."
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
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => {
                  setSelectedLanguage(item.name);
                  setIsClicked(false);
                  onSearch("");
                  setSearch("");
                }}
              >
                <Text style={styles.languageText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.languageList}
          />
        </View>
      )}

      {Clicked && (
        <View style={getDynamicStyles().dropdownArea}>
          <TextInput
            placeholder="Search languages..."
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
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => {
                  setIsSelectedLanguage(item.name);
                  setClicked(false);
                  onSearch("");
                  setSearch("");
                }}
              >
                <Text style={styles.languageText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.languageList}
          />
        </View>
      )}

      {/* Main Content Area */}
      <View style={getDynamicStyles().contentContainer}>
        {/* Text Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter text here"
            placeholderTextColor="#888"
            value={text}
            onChangeText={(input) => setText(input)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.micButton}>
            <FontAwesome5 name="microphone" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.translateButton}
            onPress={translateAndSpeak}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Translate</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        <View style={styles.resultContainer}>
          {translatedText ? (
            <>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{IsselectedLanguage || "Hindi"}</Text>
                {base64String ? (
                  <TouchableOpacity
                    style={styles.speakerButton}
                    onPress={async () => {
                      await playBase64Audio(base64String);
                    }}
                  >
                    <FontAwesome5 name="volume-up" size={16} color="#007AF5" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <ScrollView style={styles.translatedTextContainer}>
                <Text style={styles.translatedText}>{translatedText}</Text>
              </ScrollView>
            </>
          ) : (
            <Text style={styles.placeholderText}>Translation will appear here</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 10,
  },
  languageSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getResponsivePadding(),
    paddingVertical: heightScale(15),
    backgroundColor: "#fff",
  },
  languageSelectorWrapper: {
    flex: 1,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(12),
    borderRadius: widthScale(5),
    borderWidth: 0.5,
    borderColor: "#000",
  },
  languageSelectorText: {
    color: "#333",
    fontSize: fontScale(14),
    fontWeight: "500",
  },
  dashText: {
    color: "#333",
    fontSize: fontScale(14),
    fontWeight: "normal",
  },
  arrowContainer: {
    width: widthScale(40),
    alignItems: "center",
  },
  dropdownArea: {
    position: "absolute",
    top: heightScale(150),
    left: widthScale(20),
    right: widthScale(20),
    maxHeight: heightScale(250),
    borderRadius: widthScale(10),
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  searchInput: {
    width: "100%",
    height: heightScale(40),
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: widthScale(15),
    fontSize: fontScale(14),
  },
  languageList: {
    maxHeight: heightScale(200),
  },
  languageItem: {
    width: "100%",
    paddingVertical: heightScale(12),
    paddingHorizontal: widthScale(15),
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  languageText: {
    fontWeight: "500",
    color: "#333",
    fontSize: fontScale(14),
  },
  contentContainer: {
    backgroundColor: "#fff",
    marginHorizontal: widthScale(15),
    marginTop: heightScale(15),
    marginBottom: heightScale(15),
    paddingHorizontal: widthScale(10),
    paddingVertical: heightScale(15),
    justifyContent: "space-between",
    height: heightScale(400),
  },
  inputContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: widthScale(5),
    marginBottom: heightScale(15),
    borderWidth: 0.5,
    borderColor: "#000",
    height: heightScale(150),
  },
  textInput: {
    width: "100%",
    height: "100%",
    borderRadius: widthScale(5),
    padding: widthScale(12),
    fontSize: fontScale(16),
    textAlignVertical: "top",
    color: "#333",
    lineHeight: fontScale(22),
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightScale(15),
  },
  micButton: {
    backgroundColor: "#007AF5",
    width: widthScale(40),
    height: widthScale(40),
    borderRadius: widthScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  resultContainer: {
    height: heightScale(150),
    backgroundColor: "#f5f5f5",
    borderRadius: widthScale(5),
    padding: widthScale(12),
    borderWidth: 0.5,
    borderColor: "#000",
    overflow: "scroll",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightScale(8),
  },
  resultTitle: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: "#007AF5",
  },
  translatedText: {
    fontSize: fontScale(16),
    color: "#333",
    lineHeight: fontScale(22),
    maxHeight: heightScale(110),
  },
  placeholderText: {
    fontSize: fontScale(14),
    color: "#999",
    textAlign: "center",
    marginTop: heightScale(45),
  },
  speakerButton: {
    padding: widthScale(5),
  },
  translateButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(16),
    borderRadius: widthScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: fontScale(14),
    fontWeight: "600",
    textAlign: "center",
  },
  translatedTextContainer: {
    maxHeight: heightScale(110),
  },
});
