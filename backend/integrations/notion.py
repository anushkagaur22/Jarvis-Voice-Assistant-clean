import requests

def get_notion_tasks(access_token: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Notion-Version": "2022-06-28"
    }

    url = "https://api.notion.com/v1/search"
    response = requests.post(url, headers=headers)

    if response.status_code != 200:
        return {"completed": 0}

    data = response.json()

    completed = sum(
        1 for result in data.get("results", [])
        if result.get("object") == "page"
    )

    return {"completed": completed}
