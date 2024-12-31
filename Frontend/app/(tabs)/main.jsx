import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState, useRef } from "react";
import { Audio } from "expo-av";
import TabLayout from "./_layout";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Input from "@mui/joy/Input";
import { Redirect } from "expo-router";
import { useFonts } from "expo-font";

export default function translation() {
  const [text, setText] = useState("Happy Birthday!");
  const [base64String, setBase64String] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const sound = new Audio.Sound();

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
        alert("Success", "Translation and speech processed!");
      } else {
        console.error("API Error:", response.status);
        alert("Error", "Failed to process translation and speech.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error", "Something went wrong.");
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
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Language Translator</Text>
        <Image
          source={require("../list.png")}
          style={styles.list}
          onPress={() => alert("list pressed!")}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.box}>
          <TextInput
            style={styles.label_input}
            placeholder="Enter text here"
            value={text}
            onChangeText={(input) => setText(input)}
          />
          {/* <TouchableOpacity
            style={styles.mic}
            onPress={() => alert("Mic pressed!")}
          >
            <Image source={require("./monogram.png")} />
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity style={styles.button} onPress={translateAndSpeak}>
          <Text style={styles.buttonText}>Translate</Text>
        </TouchableOpacity>

        <View style={styles.box}>
          <TouchableOpacity
            // style={styles.speaker}
            onPress={async () => {
              await playBase64Audio(base64String);
            }}
          >
            <Text >{translatedText}</Text>

          </TouchableOpacity>
          <View style={styles.speaker}>
          <Text >{IsselectedLanguage}</Text>

             <TouchableOpacity
                        onPress={async () => {
                          await playBase64Audio(base64String);
                        }}
                      >
          <Image source={require("../speaker.jpg") }   />
          </TouchableOpacity>
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
            {selectedLanguage == "" ? "Select Language" : selectedLanguage}
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
              position: "relative",
              top: 50,
              right: 145,
              marginRight: 100,
              height: 300,
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
                      setSelectedLanguage(item.name);
                      setIsClicked(!isClicked);
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
            {IsselectedLanguage == "" ? "Select Language" : IsselectedLanguage}
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
              top: 50,
              right: 145,
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
                      setIsSelectedLanguage(item.name);
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

      <TabLayout />
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
  list: {
    height: 30,
    width: 30,
    right: 50,
    bottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    top: 320,
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
    top: 80,
  },
  label_input: {
    width: "100%",
    fontSize: 20,
    height: 160,
    backgroundColor: "F7F2FA",
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
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  Image: {
    width: 15,
    height: 10,
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
    paddingTop: 15,
  },
  Icon: {
    paddingTop: 25,
  },
  mic: {
    right: 110,
    bottom: 20,
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
  speaker: {
    bottom: 110,
    right: 85,
    // left: 70,
    flexDirection: "row",
    gap: 15,
  },
  translateText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
    textAlign: "center",
    justifyContent: "center",
    // top: 80,
    // left: 50,
  },
 
});
