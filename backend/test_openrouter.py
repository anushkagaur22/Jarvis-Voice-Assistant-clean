import requests

API_KEY = "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"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost",
    "X-Title": "Jarvis Test"
}

payload = {
    "model": "openai/gpt-4o-mini",
    "messages": [
        {"role": "user", "content": "Say hello"}
    ]
}

r = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers=headers,
    json=payload
)

print(r.status_code)
print(r.text)
