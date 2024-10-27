
// import React from 'react'
import { View,Text,StyleSheet,TouchableOpacity,Image,TextInput,FlatList} from 'react-native'
import React, { useState,useRef} from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'







export default function ConvoScreen() {

  const [text, setText] = useState('');

  
  const languages_list = [
    {name: "Afrikaans", code: "af"},
    {name: "Albanian - shqip", code: "sq"},
    {name: "Amharic - አማርኛ", code: "am"},
    {name: "Arabic - العربية", code: "ar"},
    {name: "Aragonese - aragonés", code: "an"},
    {name: "Armenian - հայերեն", code: "hy"},
    {name: "Asturian - asturianu", code: "ast"},
    {name: "Azerbaijani - azərbaycan dili", code: "az"},
    {name: "Basque - euskara", code: "eu"},
    {name: "Belarusian - беларуская", code: "be"},
    {name: "Bengali - বাংলা", code: "bn"},
    {name: "Bosnian - bosanski", code: "bs"},
    {name: "Breton - brezhoneg", code: "br"},
    {name: "Bulgarian - български", code: "bg"},
    {name: "Catalan - català", code: "ca"},
    {name: "Central Kurdish - کوردی (دەستنوسی عەرەبی)", code: "ckb"},
    {name: "Chinese - 中文", code: "zh"},
    {name: "Chinese (Hong Kong) - 中文（香港）", code: "zh-HK"},
    {name: "Chinese (Simplified) - 中文（简体）", code: "zh-CN"},
    {name: "Chinese (Traditional) - 中文（繁體）", code: "zh-TW"},
    {name: "Corsican", code: "co"},
    {name: "Croatian - hrvatski", code: "hr"},
    {name: "Czech - čeština", code: "cs"},
    {name: "Danish - dansk", code: "da"},
    {name: "Dutch - Nederlands", code: "nl"},
    {name: "English", code: "en"},
    {name: "English (Australia)", code: "en-AU"},
    {name: "English (Canada)", code: "en-CA"},
    {name: "English (India)", code: "en-IN"},
    {name: "English (New Zealand)", code: "en-NZ"},
    {name: "English (South Africa)", code: "en-ZA"},
    {name: "English (United Kingdom)", code: "en-GB"},
    {name: "English (United States)", code: "en-US"},
    {name: "Esperanto - esperanto", code: "eo"},
    {name: "Estonian - eesti", code: "et"},
    {name: "Faroese - føroyskt", code: "fo"},
    {name: "Filipino", code: "fil"},
    {name: "Finnish - suomi", code: "fi"},
    {name: "French - français", code: "fr"},
    {name: "French (Canada) - français (Canada)", code: "fr-CA"},
    {name: "French (France) - français (France)", code: "fr-FR"},
    {name: "French (Switzerland) - français (Suisse)", code: "fr-CH"},
    {name: "Galician - galego", code: "gl"},
    {name: "Georgian - ქართული", code: "ka"},
    {name: "German - Deutsch", code: "de"},
    {name: "German (Austria) - Deutsch (Österreich)", code: "de-AT"},
    {name: "German (Germany) - Deutsch (Deutschland)", code: "de-DE"},
    {name: "German (Liechtenstein) - Deutsch (Liechtenstein)", code: "de-LI"},
    {name: "German (Switzerland) - Deutsch (Schweiz)", code: "de-CH"},
    {name: "Greek - Ελληνικά", code: "el"},
    {name: "Guarani", code: "gn"},
    {name: "Gujarati - ગુજરાતી", code: "gu"},
    {name: "Hausa", code: "ha"},
    {name: "Hawaiian - ʻŌlelo Hawaiʻi", code: "haw"},
    {name: "Hebrew - עברית", code: "he"},
    {name: "Hindi - हिन्दी", code: "hi"},
    {name: "Hungarian - magyar", code: "hu"},
    {name: "Icelandic - íslenska", code: "is"},
    {name: "Indonesian - Indonesia", code: "id"},
    {name: "Interlingua", code: "ia"},
    {name: "Irish - Gaeilge", code: "ga"},
    {name: "Italian - italiano", code: "it"},
    {name: "Italian (Italy) - italiano (Italia)", code: "it-IT"},
    {name: "Italian (Switzerland) - italiano (Svizzera)", code: "it-CH"},
    {name: "Japanese - 日本語", code: "ja"},
    {name: "Kannada - ಕನ್ನಡ", code: "kn"},
    {name: "Kazakh - қазақ тілі", code: "kk"},
    {name: "Khmer - ខ្មែរ", code: "km"},
    {name: "Korean - 한국어", code: "ko"},
    {name: "Kurdish - Kurdî", code: "ku"},
    {name: "Kyrgyz - кыргызча", code: "ky"},
    {name: "Lao - ລາວ", code: "lo"},
    {name: "Latin", code: "la"},
    {name: "Latvian - latviešu", code: "lv"},
    {name: "Lingala - lingála", code: "ln"},
    {name: "Lithuanian - lietuvių", code: "lt"},
    {name: "Macedonian - македонски", code: "mk"},
    {name: "Malay - Bahasa Melayu", code: "ms"},
    {name: "Malayalam - മലയാളം", code: "ml"},
    {name: "Maltese - Malti", code: "mt"},
    {name: "Marathi - मराठी", code: "mr"},
    {name: "Mongolian - монгол", code: "mn"},
    {name: "Nepali - नेपाली", code: "ne"},
    {name: "Norwegian - norsk", code: "no"},
    {name: "Norwegian Bokmål - norsk bokmål", code: "nb"},
    {name: "Norwegian Nynorsk - nynorsk", code: "nn"},
    {name: "Occitan", code: "oc"},
    {name: "Oriya - ଓଡ଼ିଆ", code: "or"},
    {name: "Oromo - Oromoo", code: "om"},
    {name: "Pashto - پښتو", code: "ps"},
    {name: "Persian - فارسی", code: "fa"},
    {name: "Polish - polski", code: "pl"},
    {name: "Portuguese - português", code: "pt"},
    {name: "Portuguese (Brazil) - português (Brasil)", code: "pt-BR"},
    {name: "Portuguese (Portugal) - português (Portugal)", code: "pt-PT"},
    {name: "Punjabi - ਪੰਜਾਬੀ", code: "pa"},
    {name: "Quechua", code: "qu"},
    {name: "Romanian - română", code: "ro"},
    {name: "Romanian (Moldova) - română (Moldova)", code: "mo"},
    {name: "Romansh - rumantsch", code: "rm"},
    {name: "Russian - русский", code: "ru"},
    {name: "Scottish Gaelic", code: "gd"},
    {name: "Serbian - српски", code: "sr"},
    {name: "Serbo - Croatian", code: "sh"},
    {name: "Shona - chiShona", code: "sn"},
    {name: "Sindhi", code: "sd"},
    {name: "Sinhala - සිංහල", code: "si"},
    {name: "Slovak - slovenčina", code: "sk"},
    {name: "Slovenian - slovenščina", code: "sl"},
    {name: "Somali - Soomaali", code: "so"},
    {name: "Southern Sotho", code: "st"},
    {name: "Spanish - español", code: "es"},
    {name: "Spanish (Argentina) - español (Argentina)", code: "es-AR"},
    {name: "Spanish (Latin America) - español (Latinoamérica)", code: "es-419"},
    {name: "Spanish (Mexico) - español (México)", code: "es-MX"},
    {name: "Spanish (Spain) - español (España)", code: "es-ES"},
    {name: "Spanish (United States) - español (Estados Unidos)", code: "es-US"},
    {name: "Sundanese", code: "su"},
    {name: "Swahili - Kiswahili", code: "sw"},
    {name: "Swedish - svenska", code: "sv"},
    {name: "Tajik - тоҷикӣ", code: "tg"},
    {name: "Tamil - தமிழ்", code: "ta"},
    {name: "Tatar", code: "tt"},
    {name: "Telugu - తెలుగు", code: "te"},
    {name: "Thai - ไทย", code: "th"},
    {name: "Tigrinya - ትግርኛ", code: "ti"},
    {name: "Tongan - lea fakatonga", code: "to"},
    {name: "Turkish - Türkçe", code: "tr"},
    {name: "Turkmen", code: "tk"},
    {name: "Twi", code: "tw"},
    {name: "Ukrainian - українська", code: "uk"},
    {name: "Urdu - اردو", code: "ur"},
    {name: "Uyghur", code: "ug"},
    {name: "Uzbek - o‘zbek", code: "uz"},
    {name: "Vietnamese - Tiếng Việt", code: "vi"},
    {name: "Walloon - wa", code: "wa"},
    {name: "Welsh - Cymraeg", code: "cy"},
    {name: "Western Frisian", code: "fy"},
    {name: "Xhosa", code: "xh"},
    {name: "Yiddish", code: "yi"},
    {name: "Yoruba - Èdè Yorùbá", code: "yo"},
    {name: "Zulu - isiZulu", code: "zu"}
];
  const [selectedLanguage,setSelectedLanguage]=useState('');
  const [IsselectedLanguage,setIsSelectedLanguage]=useState('');

  const[isClicked,setIsClicked]=useState(false)
  const[Clicked,setClicked]=useState(false)

  const [data, setData] = useState(languages_list);
  const [search, setSearch] = useState('');
  const searchRef = useRef();
  const onSearch = search => {
    if (search !== '') {
      let tempData = data.filter(item => {
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
  <Text style={styles.headerText}>Conversation</Text>
  <Image
            source={require('../list.png')} 
            style={styles.list}  onPress={() => alert('list pressed!')}
          />

</View>


<View style={styles.content}>
   <View style={styles.box}>

   <View >
    
      <Text style={{bottom:50,right:100,fontSize:15}} >
      {selectedLanguage}
      </Text>
      </View>

      
      <TouchableOpacity onPress={() => alert('Replay pressed!')}>
            <Image 
              source={require('./Group.png')} 
              style={{ bottom: 80, right: 20 }} 
            />
          </TouchableOpacity>
<TouchableOpacity  style={styles.mic}  onPress={() => alert('Mic pressed!')}>
   <Image
            source={require('./monogram.png')} 
           
          />
          </TouchableOpacity>
  </View> 

  

  </View>

   

  <View style={styles.dropdowncontainer}>
      <TouchableOpacity style={styles.dropdownselector} onPress={()=>{
        setIsClicked(!isClicked)
      }} >
        <Text style={{fontWeight:'600'}}>
          {selectedLanguage == '' ? 'Select Language' : selectedLanguage}

        </Text>
          {isClicked ? (
                <Image source={require('./upload.png')} style={styles.Image} />
       ):(
        <Image source={require('./dropdown.png')} style={styles.Image} />

       )
       }
      {/* </TouchableOpacity>
      {isClicked?<View style={styles.dropdownArea}></View>:null} */}
      
           </TouchableOpacity >
      {isClicked ? (
        <View 
          style={{
            elevation: 5,
            marginTop: 5,
            position:'relative',
            top:300,
            right:160,
            marginRight:100,
            height: 300,
            // alignSelf: 'center',
            width: '40%',
            backgroundColor: '#fff',
            borderRadius: 10,
          
          }}>
          <TextInput
            placeholder="Search.."
            value={search}
            ref={searchRef}
            onChangeText={txt => {
              onSearch(txt);
              setSearch(txt);
            }}
            style={{
              width: '100%',
              height: 40,
              // alignSelf: 'center',
              borderWidth: 0.2,
              borderColor: '#8e8e8e',
              borderRadius: 7,
              marginTop: 10,
              paddingLeft: 20,
              marginBottom:10
            }}
          
          />
          
           <FlatList
            data={data}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={{
                    width: '100%',
                    // alignSelf: 'center',
                    height: 40,
                    // justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  
                  }}
                  onPress={() => {
                    setSelectedLanguage(item.name);
                    setIsClicked(!isClicked);
                    onSearch('');
                    setSearch('');
                  }}>
                    
                  <Text style={{fontWeight: '600'}}>{item.name}</Text>
                </TouchableOpacity>
                
              );
            }}
          />
        </View>
      ) : null}
      
   
      <FontAwesome6 style={styles.Icon} name="arrow-right-arrow-left" size={24} color="black" />


      <TouchableOpacity style={styles.dropdownselector} onPress={()=>{
        setClicked(!Clicked)
      }} >
        {/* <Text>Select Language</Text> */}
        <Text style={{fontWeight:'600'}}>
          {IsselectedLanguage == '' ? 'Select Language' : IsselectedLanguage}
        </Text>
          {Clicked ? (
                <Image source={require('./upload.png')} style={styles.Image} />
       ):(
        <Image source={require('./dropdown.png')} style={styles.Image} />

       )
       }
      {/* </TouchableOpacity>
      {isClicked?<View style={styles.dropdownArea}></View>:null} */}
           </TouchableOpacity>
      {Clicked ? (
        <View
          style={{
            elevation: 5,
            marginTop: 5,
            height: 300,
            position:'relative',
            top:300,
            right:155,
            // alignSelf: 'center',
            width: '40%',
            backgroundColor: '#fff',
            borderRadius: 10,
            // zIndex:1,
          }}>
          <TextInput
            placeholder="Search.."
            value={search}
            ref={searchRef}
            onChangeText={txt => {
              onSearch(txt);
              setSearch(txt);
            }}
            style={{
              width: '100%',
              height: 40,
              // alignSelf: 'center',
              borderWidth: 0.2,
              borderColor: '#8e8e8e',
              borderRadius: 7,
              marginTop: 10,
              paddingLeft: 20,
              marginBottom:10,
              

            }}
          
          />
           <FlatList
            data={data}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  style={{
                    width: '100%',
                    // alignSelf: 'center',
                    height: 40,
                    // justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                    



                  
                  }}
                  onPress={() => {
                    setIsSelectedLanguage(item.name);
                    setClicked(!Clicked);
                    onSearch('');
                    setSearch('');
                  }}>
                  <Text style={{fontWeight: '600'}}>{item.name}</Text>
                </TouchableOpacity>
                   );
                  }}
    />
    </View>
  ) : null}
    </View>
    




  <View style={styles.content_2}>

  <View style={styles.box_2}>

   <View >
      <Text style={{bottom:50,right:100,fontSize:15}} >
        {IsselectedLanguage}

        
      </Text>

      </View>
      <TouchableOpacity onPress={() => alert('Replay pressed!')}>
            <Image 
              source={require('./Group.png')} 
              style={{ bottom: 80, right: 20 }} 
            />
          </TouchableOpacity>
    <TouchableOpacity onPress={() => alert('Mic pressed!')} style={styles.mic}  >
   <Image
            source={require('./monogram.png')} 
          />
          </TouchableOpacity>
  </View> 


   {/* <View style={{ width: '95%',
  position:'absolute',
  zIndex:-1,
    height: 50,
    backgroundColor: '#F7F2FA',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 40,
    top:320}}>

  </View>   */}

  </View>

 </View>

     /* <View style={styles.container}>
     <View style={styles.header}>
       <Text style={styles.headerText}>Home</Text> 
   </View>

    
      <View style={styles.content}>
      <View style={styles.box}>
        <Text> hello </Text>
       </View>
     </View> 
   </View> */

  







  )

}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#007AF5',
    paddingTop: 30,
    // alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius:15,
    height:90,
    justifyContent:'center',
paddingLeft:70,
width:'100%'    
  },

  headerText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    top:15,
    right:10,
  },
  content_2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position:'relative',
    top:320,
    // marginTop:10,
    transform:[{ rotate: '180deg' }],

  },
  box_2: {
    width: '95%',
    height: 250,
    backgroundColor: '#F7F2FA',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // textAlign:'center',
    marginBottom: 10,
    position:'relative',
    top:530
    
    
  },


  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position:'relative',
    top:320,
    marginTop:50,
    // transform:[{ rotate: '180deg' }],

  },
  box: {
    width: '95%',
    height: 250,
    // backgroundColor: '#F8F3FA',
    backgroundColor:'#F7F2FA',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // textAlign:'center',
    marginBottom: 10,
    position:'relative',
    top:160,
    
    
  },
  label_input:{
 width: '100%',
 fontSize:20,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 40,
    // borderColor:'black',
    // borderWidth:1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingBottom:60,
    paddingLeft:50,
  },
  boxText: {
    color: '#000', 
    fontSize: 18,
  },

  // container: {
  //   flex: 1,
  //   paddingTop: 20,
  //   backgroundColor: '#f9f9f9',
  // },


  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 1,

  },
  title: {
    fontSize: 24,
  },
  dropdownselector:{
   paddingTop:6,
    width:'45%',
    height:40,
    borderRadius:10,
    borderWidth:3,
    borderColor:'#8e8e8e',
    marginTop:260,
    flexDirection:'row',
    justifyContent:'space-evenly',
    

   },
   Image:{
   width:15,
   height:10,
   paddingTop:25
  //  flex:0,
   },
   dropdownArea:{
    width:'40%',
    height:300,
    borderRadius:10,
    // marginTop:10,
    backgroundColor:'#fff',
    elevation:5,
    
  
   },
   dropdowncontainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:10,
    // backgroundColor: 'white',
    padding:0,
    // border: 'black'
   },
   Icon:{
  
   paddingTop:270,
  

   

   },

   mic:{
    top:30
   },
   button: {
    backgroundColor: '#FF6600',
    padding: 5,
    borderRadius: 40,
    height:50,
    width:140,
    bottom:5,
    left:100
  },
  buttonText: {
    color: 'white',
    fontSize: 23,
    left:20,
    
  },
  list:{
    height:30,
    width:30,
    right:50,
    bottom:20
  }


   

});

// const CustomDropdown =()=>{
//   return (
    
//   )
// }

// export default CustomDropdown;
// const styles=StyleSheet.create({
//     container:{
//         flex:1,
//     },

// })


