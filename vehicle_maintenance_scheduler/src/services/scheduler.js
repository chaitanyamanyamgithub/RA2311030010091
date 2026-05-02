const knapsack = require("../utils/knapsack");

function createSchedule(depots, vehicles) {
  const available = vehicles.map((vehicle) => ({
    id: vehicle.TaskID,
    duration: Number(vehicle.Duration),
    impact: Number(vehicle.Impact)
  }));

  const remaining = new Map(available.map((task) => [task.id, task]));
  const depotSchedules = [];

  const sortedDepots = [...depots].sort(
    (a, b) => Number(b.MechanicHours) - Number(a.MechanicHours)
  );

  for (const depot of sortedDepots) {
    const capacity = Math.max(0, Math.floor(Number(depot.MechanicHours)));
    const tasks = Array.from(remaining.values());
    const selection = knapsack(tasks, capacity);

    for (const task of selection.tasks) {
      remaining.delete(task.id);
    }

    depotSchedules.push({
      depotId: depot.ID,
      mechanicHours: capacity,
      totalDuration: selection.totalDuration,
      totalImpact: selection.totalImpact,
      tasks: selection.tasks.map((task) => ({
        taskId: task.id,
        duration: task.duration,
        impact: task.impact
      }))
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    depots: depotSchedules,
    unassignedTasks: Array.from(remaining.values()).map((task) => task.id)
  };
}

module.exports = {
  createSchedule
};
