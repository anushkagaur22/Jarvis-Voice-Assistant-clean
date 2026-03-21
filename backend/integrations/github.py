import requests
from datetime import datetime, timedelta

GITHUB_API = "https://api.github.com"


def get_github_stats(username: str):
    try:
        url = f"{GITHUB_API}/users/{username}/events/public"
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            return {"commits": 0}

        events = response.json()
        one_week_ago = datetime.utcnow() - timedelta(days=7)

        commit_count = 0

        for event in events:
            if event.get("type") == "PushEvent":
                created = datetime.strptime(
                    event["created_at"], "%Y-%m-%dT%H:%M:%SZ"
                )
                if created > one_week_ago:
                    commit_count += len(event["payload"].get("commits", []))

        return {"commits": commit_count}

    except Exception:
        return {"commits": 0}