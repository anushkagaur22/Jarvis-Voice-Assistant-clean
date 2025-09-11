import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Configuration ---
# Load environment variables from API.env
load_dotenv("API.env")

# Read API key
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ GOOGLE_API_KEY not found in API.env")
    print('Please open API.env and add this line:')
    print('GOOGLE_API_KEY="your_api_key_here"')
    exit()

# Configure Gemini
genai.configure(api_key=api_key)

# --- Model and Chat Setup ---
system_instruction = "You are Jarvis, a virtual assistant skilled in general tasks like Alexa and Google Cloud."

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash-latest",
    system_instruction=system_instruction
)

chat = model.start_chat(history=[])


def ask_jarvis(question: str) -> str:
    """Send a message to Gemini and return Jarvis's reply."""
    try:
        response = chat.send_message(question)
        return response.text
    except Exception as e:
        return f"⚠️ Error: {e}"


if __name__ == "__main__":
    print("✅ Jarvis Initialized...")
    print("Type 'quit', 'exit', or 'bye' to end the conversation.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit", "bye"]:
            print("Jarvis: Goodbye 👋")
            break

        reply = ask_jarvis(user_input)
        print("Jarvis:", reply)
