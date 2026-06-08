// scripts/storage.js — LocalStorage wrapper
const KEY = 'penalty3d_v1';

function defaults() {
  return {
    highScore:     0,
    totalGoals:    0,
    totalMatches:  0,
    classicBest:   0,
    endlessBest:   0,
    targetBest:    0,
    settings: {
      difficulty: 'medium',
      sound:      true,
      quality:    'auto'
    }
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    const d = defaults();
    return {
      ...d,
      ...parsed,
      settings: { ...d.settings, ...(parsed.settings || {}) }
    };
  } catch (_) {
    return defaults();
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (_) { /* quota exceeded or private mode — silently ignore */ }
}

/** Returns true if this score is a new all-time record */
export function recordResult(data, mode, goals) {
  data.totalMatches++;
  data.totalGoals += goals;

  const modeKey = mode + 'Best';
  if (!data[modeKey] || goals > data[modeKey]) data[modeKey] = goals;

  const isNew = goals > data.highScore;
  if (isNew) data.highScore = goals;
  return isNew;
}
