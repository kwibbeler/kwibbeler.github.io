// Weekly plan page: a week selector that shows that specific week's daily
// breakdown. Week 1 is this week (the most weeks remain to race); the last
// week in the list is the week right before race week.

const setup = loadPlanSetup();

if (!setup) {
  document.getElementById("noPlan").hidden = false;
} else {
  const { distance, weeksOut, experience, daysPerWeek, dayPrefs } = setup;

  const weekSelect = document.getElementById("weekSelect");
  for (let week = 1; week <= weeksOut; week++) {
    const opt = document.createElement("option");
    opt.value = week;
    const remaining = weeksOut - (week - 1);
    opt.textContent = `Week ${week} (${remaining} week${remaining === 1 ? "" : "s"} to race)`;
    weekSelect.appendChild(opt);
  }
  document.getElementById("weekPicker").hidden = false;

  const overviewEl = document.getElementById("overview");
  const weeklyEl = document.getElementById("weeklySchedule");
  const outputSection = document.getElementById("output");

  function renderWeek(weekNumber) {
    const remaining = weeksOut - (weekNumber - 1);
    const plan = buildWeek({ distance, weeksOut: remaining, experience, daysPerWeek, dayPrefs });
    const hours = (plan.totalMinutes / 60).toFixed(1);

    overviewEl.innerHTML = `
      <h3>${plan.phase.name} phase</h3>
      <dl>
        <dt>Week</dt><dd>${weekNumber} of ${weeksOut}</dd>
        <dt>Weeks to race</dt><dd>${remaining}</dd>
        <dt>Focus this phase</dt><dd>${plan.phase.focus}</dd>
        <dt>This week</dt><dd>${hours} hours across ${
      plan.days.filter((d) => !d.rest).length
    } sessions</dd>
      </dl>
    `;

    weeklyEl.innerHTML = "";
    plan.days.forEach((d) => {
      const card = document.createElement("div");
      card.className = "day-card" + (d.rest ? " rest" : ` disc-${d.discipline}`);
      if (d.rest) {
        card.innerHTML = `<h4>${d.day}</h4><p>Rest day. Recovery is part of the training, not time off from it.</p>`;
      } else {
        const distanceLine = d.meters ? `<p>${d.meters}m total</p>` : "";
        card.innerHTML = `
          <h4>${d.day}</h4>
          <span class="discipline">${DISCIPLINE_LABELS[d.discipline]}</span>
          <p class="duration">${d.minutes} min &middot; ${d.intensity}</p>
          ${distanceLine}
          <p>${d.structure}</p>
        `;
      }
      weeklyEl.appendChild(card);
    });

    outputSection.hidden = false;
  }

  weekSelect.addEventListener("change", () => renderWeek(Number(weekSelect.value)));
  renderWeek(1);
}
