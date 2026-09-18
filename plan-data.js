// Tri Plan Builder - shared plan data and logic.
// No DOM code lives here on purpose: index.html, phases.html and weekly.html
// each load this file, then add their own small script for what that page
// actually shows. Keeping the data and the rules in one place means all
// three pages compute the same plan the same way.

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DISCIPLINES = ["swim", "bike", "run", "strength"];
const DISCIPLINE_LABELS = {
  swim: "Swim",
  bike: "Bike",
  run: "Run",
  strength: "Strength",
};

// --- Phase boundaries -------------------------------------------------
// Weeks-out is inclusive of the lower bound and exclusive of the upper bound.
const PHASES = [
  {
    id: "base",
    name: "Base",
    minWeeks: 20,
    maxWeeks: Infinity,
    focus:
      "Building an aerobic foundation: mostly easy, conversational-pace work, plus swim and run technique.",
  },
  {
    id: "build",
    name: "Build",
    minWeeks: 8,
    maxWeeks: 20,
    focus:
      "Layering in threshold and tempo intervals on top of the base, so the body starts adapting to race-like effort.",
  },
  {
    id: "peak",
    name: "Peak",
    minWeeks: 3,
    maxWeeks: 8,
    focus:
      "The biggest volume and the most race-specific sessions: long rides and runs at goal pace, and bricks.",
  },
  {
    id: "taper",
    name: "Taper",
    minWeeks: 0,
    maxWeeks: 3,
    focus:
      "Volume drops sharply while a little intensity stays, so the legs arrive at the start line fresh, not fit-and-tired.",
  },
];

function getPhase(weeksOut) {
  return PHASES.find((p) => weeksOut >= p.minWeeks && weeksOut < p.maxWeeks);
}

// --- Scaling factors ----------------------------------------------------
// Duration and swim distance scale with race distance and experience.
// Strength scales with experience only; the race is not lifted.
const DISTANCE_FACTORS = {
  sprint: 0.65,
  olympic: 0.8,
  "70.3": 1.0,
  full: 1.3,
};

const EXPERIENCE_FACTORS = {
  beginner: 0.85,
  intermediate: 1.0,
  advanced: 1.15,
};

function scaleMinutes(base, distance, experience, useDistanceFactor = true) {
  const distFactor = useDistanceFactor ? DISTANCE_FACTORS[distance] : 1;
  const expFactor = EXPERIENCE_FACTORS[experience];
  const scaled = base * distFactor * expFactor;
  return Math.max(10, Math.round(scaled / 5) * 5);
}

function scaleMeters(base, distance, experience) {
  const scaled = base * DISTANCE_FACTORS[distance] * EXPERIENCE_FACTORS[experience];
  return Math.max(200, Math.round(scaled / 50) * 50);
}

// --- Workout content library ---------------------------------------------
// Two variants per phase/discipline; sessions alternate between them across
// the week so the plan doesn't repeat the exact same workout every time.
// Grounded in standard triathlon periodization (base -> build -> peak ->
// taper) and typical session shapes for each: see RESOURCES.md and the
// project's DECISIONS.md for what was adapted from the deployed
// triathlon-training-app and what came from outside research.
const WORKOUTS = {
  base: {
    swim: [
      {
        meters: 1600,
        minutes: 40,
        structure:
          "400m easy warm-up, then 10 x 100m at a moderate, controlled effort with 15s rest, 300m easy cool-down.",
        intensity: "Zone 2, conversational",
      },
      {
        meters: 1400,
        minutes: 35,
        structure:
          "200m warm-up, 8 x 50m drill (catch-up, fist, single-arm) with 20s rest, 400m steady swim, 200m cool-down.",
        intensity: "Zone 1-2, technique focus",
      },
    ],
    bike: [
      {
        minutes: 75,
        structure:
          "Steady endurance ride on flat-to-rolling terrain, cadence 85-95rpm, stay easy the whole way.",
        intensity: "Zone 2",
      },
      {
        minutes: 60,
        structure:
          "Endurance ride with 4 x 5min at a slightly higher cadence (95-100rpm) to build leg speed; otherwise easy.",
        intensity: "Zone 2, with light cadence work",
      },
    ],
    run: [
      {
        minutes: 40,
        structure:
          "Easy continuous run, relaxed form, steady cadence around 170-180 steps per minute.",
        intensity: "Zone 2",
      },
      {
        minutes: 35,
        structure:
          "Easy run finishing with 6 x 20s relaxed strides to wake the legs up; otherwise easy.",
        intensity: "Zone 2, with light strides",
      },
    ],
    strength: [
      {
        minutes: 45,
        structure:
          "3x10 goblet squats, 3x10 Romanian deadlifts, 3x10 single-leg step-ups (each leg), 3x12 single-arm rows, 3x30s plank.",
        intensity: "Moderate, controlled load",
      },
      {
        minutes: 40,
        structure:
          "3x12 walking lunges, 3x10 single-leg glute bridges, 3x10 push-ups, 3x10 band pull-aparts, 3x30s side plank each side.",
        intensity: "Moderate, controlled load",
      },
    ],
  },
  build: {
    swim: [
      {
        meters: 2000,
        minutes: 50,
        structure:
          "400m warm-up, main set 6 x 300m at threshold pace with 30s rest, 300m cool-down.",
        intensity: "Zone 3-4, threshold",
      },
      {
        meters: 1800,
        minutes: 45,
        structure:
          "400m warm-up, 12 x 100m descending (each one a little faster than the last) with 20s rest, 300m cool-down.",
        intensity: "Zone 3-4",
      },
    ],
    bike: [
      {
        minutes: 90,
        structure:
          "15min easy warm-up, 4 x 8min at threshold effort with 4min easy recovery between, 15min easy cool-down.",
        intensity: "Zone 4 intervals",
      },
      {
        minutes: 75,
        structure:
          "20min easy, 30min continuous at a strong, sustainable tempo effort, 15min easy cool-down.",
        intensity: "Zone 3 tempo",
      },
    ],
    run: [
      {
        minutes: 50,
        structure:
          "10min easy warm-up, main set 5 x 4min at threshold pace with 2min easy jog recovery, 10min easy cool-down.",
        intensity: "Zone 4 intervals",
      },
      {
        minutes: 45,
        structure:
          "15min easy, 20min continuous at a comfortably-hard tempo effort, 10min easy cool-down.",
        intensity: "Zone 3 tempo",
      },
    ],
    strength: [
      {
        minutes: 40,
        structure:
          "4x6 back squats, 3x8 single-leg Romanian deadlifts (each leg), 3x8 kettlebell swings, 3x10 pallof press (each side).",
        intensity: "Moderate-heavy load",
      },
      {
        minutes: 35,
        structure:
          "4x6 deadlifts, 3x10 Bulgarian split squats (each leg), 3x10 single-arm dumbbell rows, 3x30s hollow hold.",
        intensity: "Moderate-heavy load",
      },
    ],
  },
  peak: {
    swim: [
      {
        meters: 2200,
        minutes: 55,
        structure:
          "500m warm-up, continuous 1500m at goal race pace, 200m easy cool-down. Practice sighting if you'll swim in open water.",
        intensity: "Race pace",
      },
      {
        meters: 2000,
        minutes: 50,
        structure: "400m warm-up, 5 x 400m at race pace with 45s rest, 300m cool-down.",
        intensity: "Race pace intervals",
      },
    ],
    bike: [
      {
        minutes: 120,
        structure:
          "Long ride at race-day pacing and nutrition; last 20min at goal race effort. Practice fueling every 20 minutes, like you will on race day.",
        intensity: "Endurance building to race pace",
      },
      {
        minutes: 75,
        structure:
          "Brick setup: 60min at race-pace effort on the bike, then move straight into a short run off the bike (see today's run).",
        intensity: "Race pace, brick",
      },
    ],
    run: [
      {
        minutes: 70,
        structure:
          "Long run at a steady aerobic effort; last 15 minutes at goal race pace to rehearse the finish.",
        intensity: "Endurance building to race pace",
      },
      {
        minutes: 25,
        structure:
          "Short run straight off the bike: 20min at race-pace effort, focused on finding your run legs quickly.",
        intensity: "Race pace, brick",
      },
    ],
    strength: [
      {
        minutes: 30,
        structure:
          "3x5 squats at a moderate load (hold strength, don't chase fatigue), 3x8 single-leg box step-ups, 2x30s plank.",
        intensity: "Light-moderate, maintenance",
      },
      {
        minutes: 25,
        structure:
          "2x6 kettlebell swings, 2x8 single-leg glute bridges, 2x20s side plank each side. Short and activating, not exhausting.",
        intensity: "Light, maintenance",
      },
    ],
  },
  taper: {
    swim: [
      {
        meters: 1000,
        minutes: 25,
        structure:
          "300m easy warm-up, 6 x 50m at race pace with full rest to stay sharp, 300m easy cool-down.",
        intensity: "Short and sharp",
      },
      {
        meters: 800,
        minutes: 20,
        structure: "Easy continuous swim, technique focus only, nothing hard.",
        intensity: "Zone 1-2",
      },
    ],
    bike: [
      {
        minutes: 45,
        structure:
          "Easy spin with 4 x 3min at race pace to keep the legs sharp; otherwise fully easy.",
        intensity: "Zone 2 with short race-pace efforts",
      },
      {
        minutes: 30,
        structure: "Recovery spin on flat terrain, conversational effort only.",
        intensity: "Zone 1-2",
      },
    ],
    run: [
      {
        minutes: 30,
        structure: "Easy run with 4 x 20s strides at race effort; otherwise relaxed.",
        intensity: "Zone 2 with short strides",
      },
      {
        minutes: 20,
        structure: "Very easy, short shakeout run on flat ground, just to stay loose.",
        intensity: "Zone 1",
      },
    ],
    strength: [
      {
        minutes: 15,
        structure:
          "Light mobility circuit: hip openers, leg swings, banded activation, 2x30s plank. No loaded lifting this close to race day.",
        intensity: "Very light",
      },
      {
        minutes: 10,
        structure:
          "Short activation routine: bodyweight squats, glute bridges, band pull-aparts. Just enough to stay loose.",
        intensity: "Very light",
      },
    ],
  },
};

// Target share of the week's training days that go to each discipline, used
// to decide what an "Any" day becomes. Strength drops in the taper because
// this close to race day the priority is freshness, not new adaptation.
const DISCIPLINE_RATIOS = {
  base: { swim: 0.28, bike: 0.3, run: 0.27, strength: 0.15 },
  build: { swim: 0.25, bike: 0.32, run: 0.28, strength: 0.15 },
  peak: { swim: 0.22, bike: 0.35, run: 0.3, strength: 0.13 },
  taper: { swim: 0.3, bike: 0.32, run: 0.3, strength: 0.08 },
};

function idealCounts(daysPerWeek, ratios) {
  const entries = DISCIPLINES.map((d) => [d, daysPerWeek * ratios[d]]);
  const counts = {};
  entries.forEach(([d, v]) => (counts[d] = Math.floor(v)));
  let remainder = daysPerWeek - Object.values(counts).reduce((a, b) => a + b, 0);
  const byFraction = entries
    .map(([d, v]) => [d, v - counts[d]])
    .sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < remainder; i++) {
    counts[byFraction[i % byFraction.length][0]] += 1;
  }
  return counts;
}

// --- Filling in "Any" days -----------------------------------------------
// Spread `count` marks evenly across `total` positions, e.g. evenlySpread(7,
// 2) -> [0, 3]; used to pick which "Any" days become rest so they land
// roughly evenly through the week instead of bunching at the end.
function evenlySpread(total, count) {
  const indices = [];
  for (let i = 0; i < count; i++) {
    indices.push(Math.floor((i * total) / count));
  }
  return indices;
}

// Turns every "any" entry into either "rest" or leaves it "any" (to be given
// a discipline later), so the resulting week always has exactly
// daysPerWeek training days, with no further input needed from the person.
function resolveAnyDays(dayPrefs, daysPerWeek) {
  const resolved = { ...dayPrefs };
  const anyDays = DAY_NAMES.filter((d) => dayPrefs[d] === "any");
  const fixedRestCount = DAY_NAMES.filter((d) => dayPrefs[d] === "rest").length;
  const restNeededFromAny = 7 - daysPerWeek - fixedRestCount;

  const restPositions = new Set(evenlySpread(anyDays.length, Math.max(0, restNeededFromAny)));
  anyDays.forEach((day, i) => {
    if (restPositions.has(i)) {
      resolved[day] = "rest";
    }
  });
  return resolved;
}

function assignDisciplines(dayPrefs, phaseId, daysPerWeek) {
  const ratios = DISCIPLINE_RATIOS[phaseId];
  const target = idealCounts(daysPerWeek, ratios);
  const current = { swim: 0, bike: 0, run: 0, strength: 0 };
  const assigned = {};

  // Fixed choices first, since the person asked for them directly.
  DAY_NAMES.forEach((day) => {
    const pref = dayPrefs[day];
    if (DISCIPLINES.includes(pref)) {
      assigned[day] = pref;
      current[pref] += 1;
    }
  });

  // "Any" days fill in whichever discipline is furthest below its target
  // share for this phase.
  DAY_NAMES.forEach((day) => {
    if (dayPrefs[day] === "any") {
      let best = DISCIPLINES[0];
      let bestDeficit = -Infinity;
      DISCIPLINES.forEach((d) => {
        const deficit = target[d] - current[d];
        if (deficit > bestDeficit) {
          bestDeficit = deficit;
          best = d;
        }
      });
      assigned[day] = best;
      current[best] += 1;
    }
  });

  return assigned;
}

function pickVariant(phaseId, discipline, sessionIndex) {
  const variants = WORKOUTS[phaseId][discipline];
  return variants[sessionIndex % variants.length];
}

// Builds one week's plan. `weeksOut` is however many weeks remain to race
// day as of that week, which is what decides the phase; a full plan is just
// this function called once per week with a different `weeksOut`.
function buildWeek({ distance, weeksOut, experience, daysPerWeek, dayPrefs }) {
  const phase = getPhase(weeksOut);
  const assigned = assignDisciplines(dayPrefs, phase.id, daysPerWeek);
  const sessionCounts = { swim: 0, bike: 0, run: 0, strength: 0 };

  const days = DAY_NAMES.map((day) => {
    if (dayPrefs[day] === "rest") {
      return { day, rest: true };
    }
    const discipline = assigned[day];
    const variant = pickVariant(phase.id, discipline, sessionCounts[discipline]);
    sessionCounts[discipline] += 1;

    const useDistanceFactor = discipline !== "strength";
    const minutes = scaleMinutes(variant.minutes, distance, experience, useDistanceFactor);
    const meters =
      discipline === "swim" ? scaleMeters(variant.meters, distance, experience) : null;

    return {
      day,
      rest: false,
      discipline,
      minutes,
      meters,
      structure: variant.structure,
      intensity: variant.intensity,
    };
  });

  const totalMinutes = days.reduce((sum, d) => sum + (d.minutes || 0), 0);

  return { phase, weeksOut, days, totalMinutes };
}

// --- Carrying the setup between pages -------------------------------------
// Plain multi-page HTML has no shared state of its own, so the setup form
// saves here and the other two pages read it back. Nothing here is
// sensitive, so localStorage (kept in the visitor's own browser) is enough;
// no server or account is involved.
const STORAGE_KEY = "triPlanSetup";

function savePlanSetup(setup) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
}

function loadPlanSetup() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
