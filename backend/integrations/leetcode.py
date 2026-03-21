import requests

LEETCODE_API = "https://leetcode.com/graphql"


def get_leetcode_stats(username: str):
    try:
        query = """
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
        """

        variables = {"username": username}

        response = requests.post(
            LEETCODE_API,
            json={"query": query, "variables": variables},
            timeout=10
        )

        if response.status_code != 200:
            return {"solved": 0}

        data = response.json()
        user = data.get("data", {}).get("matchedUser")

        if not user:
            return {"solved": 0}

        stats = user.get("submitStats", {}).get("acSubmissionNum", [])

        for item in stats:
            if item.get("difficulty") == "All":
                return {"solved": item.get("count", 0)}

        return {"solved": 0}

    except Exception:
        return {"solved": 0}