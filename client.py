import ollama

# Function to send a chat request to Jarvis
def ask_jarvis(messages):
    response = ollama.chat(
        model="deepseek-r1:1.5b",
        messages=messages
    )
    return response["message"]["content"]

if __name__ == "__main__":
    print("Jarvis Initialized...")
    messages = [
        {"role": "system", "content": "You are Jarvis, a virtual assistant skilled in general tasks like Alexa and google cloud ."}
    ]
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit", "bye"]:
            print("Jarvis: Goodbye 👋")
            break

        messages.append({"role": "user", "content": user_input})
        reply = ask_jarvis(messages)
        messages.append({"role": "assistant", "content": reply})
        
        print("Jarvis:", reply)
