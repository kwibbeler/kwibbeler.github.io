// Phases page: shows the four training phases in general, and (when a plan
// has been set up) how this specific timeline splits across them.

const setup = loadPlanSetup();

if (!setup) {
  document.getElementById("noPlan").hidden = false;
} else {
  const { distance, weeksOut, experience } = setup;
  const distanceLabel =
    distance === "70.3" ? "70.3 (Half Iron)" : distance[0].toUpperCase() + distance.slice(1);

  document.getElementById("planSummary").hidden = false;
  document.getElementById("planSummary").innerHTML = `
    <dl>
      <dt>Race distance</dt><dd>${distanceLabel}</dd>
      <dt>Starting point</dt><dd>${weeksOut} weeks out</dd>
      <dt>Experience level</dt><dd>${experience[0].toUpperCase() + experience.slice(1)}</dd>
    </dl>
  `;

  // Week 1 is this week (weeksOut weeks remaining); the last week of the
  // plan is the week right before race week (1 week remaining).
  const weekPhases = [];
  for (let week = 1; week <= weeksOut; week++) {
    const remaining = weeksOut - (week - 1);
    weekPhases.push({ week, phase: getPhase(remaining) });
  }

  // Group consecutive weeks that share a phase into one range.
  const ranges = [];
  weekPhases.forEach(({ week, phase }) => {
    const last = ranges[ranges.length - 1];
    if (last && last.phase.id === phase.id) {
      last.endWeek = week;
    } else {
      ranges.push({ phase, startWeek: week, endWeek: week });
    }
  });

  document.getElementById("phaseBreakdown").hidden = false;
  const breakdownList = document.getElementById("breakdownList");
  breakdownList.innerHTML = "";
  ranges.forEach((r) => {
    const span = r.endWeek - r.startWeek + 1;
    const card = document.createElement("div");
    card.className = `day-card phase-${r.phase.id}`;
    const label =
      r.startWeek === r.endWeek ? `Week ${r.startWeek}` : `Weeks ${r.startWeek}-${r.endWeek}`;
    card.innerHTML = `
      <span class="discipline">${r.phase.name}</span>
      <h4>${label}</h4>
      <p>${span} week${span === 1 ? "" : "s"}</p>
    `;
    breakdownList.appendChild(card);
  });
}

// The four phases in general, always shown as a reference.
const phaseReference = document.getElementById("phaseReference");
PHASES.forEach((phase) => {
  const card = document.createElement("div");
  card.className = `day-card phase-${phase.id}`;
  const range =
    phase.maxWeeks === Infinity
      ? `${phase.minWeeks}+ weeks out`
      : `${phase.minWeeks}-${phase.maxWeeks - 1} weeks out`;
  card.innerHTML = `
    <span class="discipline">${phase.name}</span>
    <h4>${range}</h4>
    <p>${phase.focus}</p>
  `;
  phaseReference.appendChild(card);
});
