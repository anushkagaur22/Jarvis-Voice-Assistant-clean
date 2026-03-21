import requests

def get_github_commits(username):
    url = f"https://api.github.com/users/{username}/events"
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "GitHub user not found"}

    events = response.json()
    commits = [event for event in events if event["type"] == "PushEvent"]

    return {"total_push_events": len(commits)}
