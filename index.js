// Setup page: build the day-of-week grid, validate it against the
// days-per-week choice, and on "Build my plan" save everything to
// localStorage (see plan-data.js) and hand off to phases.html.

const dayGrid = document.getElementById("dayGrid");
DAY_NAMES.forEach((day) => {
  const label = document.createElement("label");
  label.textContent = day;
  const select = document.createElement("select");
  select.id = `day-${day}`;
  select.dataset.day = day;
  const options = [
    ["any", "Any"],
    ["rest", "Rest"],
    ["swim", "Swim"],
    ["bike", "Bike"],
    ["run", "Run"],
    ["strength", "Strength"],
  ];
  options.forEach(([value, text]) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    select.appendChild(opt);
  });
  label.appendChild(select);
  dayGrid.appendChild(label);
});

const daysPerWeekSelect = document.getElementById("daysPerWeek");
const validationMessage = document.getElementById("validationMessage");

function getDayPrefs() {
  const prefs = {};
  DAY_NAMES.forEach((day) => {
    prefs[day] = document.getElementById(`day-${day}`).value;
  });
  return prefs;
}

// "Any" leaves the choice to the plan, including whether that day ends up as
// rest. Only an explicit pick (a named discipline, or Rest) can conflict with
// the days-per-week target; "Any" days flex to whatever is left over.
function checkValidation() {
  const prefs = getDayPrefs();
  const target = Number(daysPerWeekSelect.value);
  const fixedWorkoutDays = DAY_NAMES.filter((d) => DISCIPLINES.includes(prefs[d]));
  const fixedRestDays = DAY_NAMES.filter((d) => prefs[d] === "rest");

  if (fixedWorkoutDays.length > target) {
    validationMessage.hidden = false;
    validationMessage.textContent = `You've set ${fixedWorkoutDays.length} specific days to a workout, which is already more than the ${target} days per week you picked. Set one back to Any or Rest, or raise the days-per-week menu.`;
    return false;
  }
  if (fixedRestDays.length > 7 - target) {
    validationMessage.hidden = false;
    validationMessage.textContent = `You've set ${fixedRestDays.length} days to Rest, which leaves fewer than ${target} days for training. Set one back to Any, or lower the days-per-week menu.`;
    return false;
  }
  validationMessage.hidden = true;
  return true;
}

dayGrid.addEventListener("change", checkValidation);
daysPerWeekSelect.addEventListener("change", checkValidation);

document.getElementById("generateBtn").addEventListener("click", () => {
  if (!checkValidation()) {
    return;
  }
  const distance = document.getElementById("distance").value;
  const weeksOut = Number(document.getElementById("weeksOut").value);
  const experience = document.getElementById("experience").value;
  const daysPerWeek = Number(daysPerWeekSelect.value);
  const dayPrefs = resolveAnyDays(getDayPrefs(), daysPerWeek);

  savePlanSetup({ distance, weeksOut, experience, daysPerWeek, dayPrefs });
  window.location.href = "phases.html";
});
