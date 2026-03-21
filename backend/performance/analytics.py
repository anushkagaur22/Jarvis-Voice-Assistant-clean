from datetime import datetime, timedelta

def generate_weekly_report(score: float):
    if score >= 85:
        return "🔥 Excellent productivity this week!"
    elif score >= 60:
        return "👍 Good progress. Stay consistent."
    elif score >= 40:
        return "⚠️ Moderate productivity. Improve focus."
    else:
        return "🚨 Low productivity. Let's reset and plan better."
