def calculate_performance_score(
 commits,
    leetcode,
    events,
    tasks
):
    score = (
        commits * 2 +
        leetcode * 3 +
        events * 1 +
        tasks * 2
    )

    return min(score, 100)
