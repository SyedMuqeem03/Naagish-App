```markdown
# 🌐 Translation & Text-to-Speech API

## 📜 Overview
Translate text and convert it to speech using Google Gemini and Sarvam AI.

## 🚀 Endpoint

### `POST /translate_and_speak`

**Request Body:**
```json
{
    "text": "I learned to speak in Hindi.",
    "language": "hi-IN",
    "target_language": "telugu",
    "voice_model": "meera"
}
```

**Response:**
```json
{
    "translated_text": "నేను హిందీ లో మాట్లాడటం నేర్చుకున్నాను.",
    "audio_data": "base64_encoded_audio_string"
}
```

## 💻 Installation

1. Clone the repo:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Create & activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   ```
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

## 🏃‍♂️ Usage

Run the API:
```bash
python app.py
```

## 🔑 Notes
- Replace API keys in the code.

## 📄 License
MIT License.
```
