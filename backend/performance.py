def calculate_performance_score(study_hours, dsa_questions, consistency, goal_completion):
    score = (
        (study_hours * 0.4) +
        (dsa_questions * 0.3) +
        (consistency * 0.2) +
        (goal_completion * 0.1)
    )
    return round(score, 2)


def generate_weekly_report(score):
    if score >= 80:
        return "🔥 Excellent performance! Keep pushing."
    elif score >= 60:
        return "⚡ Good progress. Improve consistency."
    else:
        return "🚨 Focus needed. Reduce distractions."
