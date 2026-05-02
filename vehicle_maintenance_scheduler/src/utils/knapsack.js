function betterOption(a, b) {
  if (a.totalImpact !== b.totalImpact) {
    return a.totalImpact > b.totalImpact;
  }
  if (a.totalCount !== b.totalCount) {
    return a.totalCount > b.totalCount;
  }
  return a.totalDuration < b.totalDuration;
}

function knapsack(tasks, capacity) {
  const dp = Array.from({ length: capacity + 1 }, () => ({
    totalImpact: 0,
    totalCount: 0,
    totalDuration: 0,
    tasks: []
  }));

  for (const task of tasks) {
    if (!Number.isFinite(task.duration) || task.duration <= 0) {
      continue;
    }

    const duration = Math.floor(task.duration);
    if (duration > capacity) {
      continue;
    }

    for (let c = capacity; c >= duration; c -= 1) {
      const candidate = dp[c - duration];
      const nextOption = {
        totalImpact: candidate.totalImpact + task.impact,
        totalCount: candidate.totalCount + 1,
        totalDuration: candidate.totalDuration + duration,
        tasks: [...candidate.tasks, task]
      };

      if (betterOption(nextOption, dp[c])) {
        dp[c] = nextOption;
      }
    }
  }

  let best = dp[0];
  for (const option of dp) {
    if (betterOption(option, best)) {
      best = option;
    }
  }

  return {
    totalImpact: best.totalImpact,
    totalDuration: best.totalDuration,
    tasks: best.tasks
  };
}

module.exports = knapsack;
