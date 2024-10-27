import requests
import base64

def save_audio_from_base64(base64_string, output_file):
    """Decode base64 string and save it as an audio file."""
    audio_data = base64.b64decode(base64_string)
    with open(output_file, 'wb') as audio_file:
        audio_file.write(audio_data)
    print(f"Audio file saved as {output_file}")

def text_to_speech(text, language_code="hi-IN", speaker="meera"):
    """Convert text to speech using Sarvam AI's TTS API."""
    url = "https://api.sarvam.ai/text-to-speech"

    payload = {
        "inputs": [text],
        "target_language_code": language_code,  # Ensure this is correct
        "speaker": speaker,
        "model": "bulbul:v1"
    }

    headers = {
        "api-subscription-key": "4cf5e4fb-fe1d-4c5c-9c58-8a4c3da4ec91",  # Your actual API key
        "Content-Type": "application/json"
    }

    print(f"Sending request to Sarvam API with payload: {payload}")  # Log the payload

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an error for bad responses
        response_data = response.json()
        
        if "audios" in response_data and response_data["audios"]:
            return response_data["audios"][0]  # Return the base64 audio string
        else:
            return None  # No audio data received

    except requests.exceptions.RequestException as e:
        return f"Error occurred: {e}"
