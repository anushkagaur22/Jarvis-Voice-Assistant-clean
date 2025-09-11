import os
import google.generativeai as genai
from dotenv import load_dotenv
import speech_recognition as sr
import webbrowser
import pyttsx3
import musicLibrary
import requests

# ----------------- CONFIG -----------------
# Load API key from API.env
load_dotenv("API.env")
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ GOOGLE_API_KEY not found in API.env")
    exit()

# Configure Gemini
genai.configure(api_key=api_key)

# Initialize Gemini model
system_instruction = "You are Jarvis, a helpful voice assistant. Reply briefly and clearly."
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash-latest",
    system_instruction=system_instruction
)
chat = model.start_chat(history=[])

# Initialize speech engine
engine = pyttsx3.init()

# News API key
newsapi = "cae53adfbb9c4f6d965a1789c434b8b0"  # replace with your valid key

# ----------------- FUNCTIONS -----------------
def speak(text):
    """Text-to-Speech"""
    print("Jarvis:", text)
    engine.say(text)
    engine.runAndWait()

def aiprocess(command):
    """Send user command to Google Gemini"""
    try:
        response = chat.send_message(command)
        reply = response.text.strip() if response.text else "Sorry, I didn’t get a response."
        speak(reply)
    except Exception as e:
        print("Gemini Error:", e)
        speak("Sorry, I couldn’t process that.")

def processCommand(c):
    """Handle user commands"""
    c = c.lower()

    if "open google" in c:
        speak("Opening Google")
        webbrowser.open("https://www.google.com")

    elif "open facebook" in c:
        speak("Opening Facebook")
        webbrowser.open("https://www.facebook.com")

    elif "open youtube" in c:
        speak("Opening YouTube")
        webbrowser.open("https://www.youtube.com")

    elif "open instagram" in c:
        speak("Opening Instagram")
        webbrowser.open("https://www.instagram.com")

    elif "open linkedin" in c:
        speak("Opening LinkedIn")
        webbrowser.open("https://www.linkedin.com")

    elif c.startswith("play"):
        song = c[5:].strip().lower()
        for key in musicLibrary.music:
            if key.lower() == song:
                speak(f"Playing {key}")
                webbrowser.open(musicLibrary.music[key])
                return
        speak("Sorry, I don't know that song.")

    elif "news" in c:
        speak("Fetching top news for you")
        r = requests.get(f"https://newsapi.org/v2/top-headlines?country=in&apiKey={newsapi}")
        if r.status_code == 200:
            data = r.json()
            if data.get("status") == "ok":
                articles = data.get('articles', [])
                for article in articles[:5]:
                    if 'title' in article:
                        speak(article['title'])
            else:
                speak("News API error: " + data.get("message", "Unknown error"))
        else:
            speak("Failed to fetch news.")

    else:
        # Ask Gemini AI
        aiprocess(c)

# ----------------- MAIN LOOP -----------------
if __name__ == "__main__":
    speak("Initializing Jarvis....")
    recognizer = sr.Recognizer()

    while True:
        try:
            with sr.Microphone() as source:
                print("Listening for wake word...")
                audio = recognizer.listen(source, timeout=8, phrase_time_limit=5)

            try:
                word = recognizer.recognize_google(audio)
            except sr.UnknownValueError:
                continue

            if "jarvis" in word.lower():
                speak("Yes, how can I help you?")
                with sr.Microphone() as source:
                    audio = recognizer.listen(source, timeout=8, phrase_time_limit=7)
                    try:
                        command = recognizer.recognize_google(audio)
                        processCommand(command)
                    except sr.UnknownValueError:
                        speak("Sorry, I didn’t catch that.")
                        continue

        except Exception as e:
            print("Error:", e)
