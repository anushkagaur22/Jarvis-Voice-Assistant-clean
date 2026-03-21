import os

import requests


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def ask_ai(history):
    messages = [
        {
            "role": "system",
            "content": "You are Jarvis, a friendly voice-first AI assistant."
        }
    ]

    for h in history:
        messages.append(h)

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Jarvis Test"
        },
        json={
            "model": "openai/gpt-4o-mini",
            "messages": messages
        },
        timeout=60
    )

    data = response.json()

    if response.status_code != 200:
        raise RuntimeError(data)

    return data["choices"][0]["message"]["content"]
