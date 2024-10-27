import google.generativeai as genai

def configure_gemini(api_key):
    """Configure the Gemini API and start a chat session."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    chat = model.start_chat()
    return chat

def translate_text(chat, input_text, target_language):
    """Translate input text to the specified target language using the Gemini API."""
    gf = {
        "temperature": 0.9,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 528,
    }
    language_request = f"Translate this to {target_language}: {input_text}!"
    response = chat.send_message(language_request, generation_config=gf)
    return response.text
