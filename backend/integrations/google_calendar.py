import requests
from datetime import datetime, timedelta


def get_calendar_events(access_token: str):
    try:
        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        now = datetime.utcnow().isoformat() + "Z"
        one_week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"

        url = (
            "https://www.googleapis.com/calendar/v3/calendars/primary/events"
            f"?timeMin={one_week_ago}&timeMax={now}&singleEvents=true"
        )

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            return {"events": 0}

        data = response.json()
        return {"events": len(data.get("items", []))}

    except Exception:
        return {"events": 0}