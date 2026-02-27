const API_BASE = process.env.REACT_APP_API_URL || '';

export async function fetchStates() {
  const res = await fetch(`${API_BASE}/api/states`);
  if (!res.ok) throw new Error('Failed to fetch states');
  return res.json();
}

export async function fetchDistrictData(state, district) {
  const res = await fetch(`${API_BASE}/api/district-data/${encodeURIComponent(state)}/${encodeURIComponent(district)}`);
  if (!res.ok) throw new Error('Failed to fetch district data');
  return res.json();
}

export async function fetchWeather(lat, lon) {
  const res = await fetch(`${API_BASE}/api/weather/${lat}/${lon}`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function submitAssessment(data) {
  const res = await fetch(`${API_BASE}/api/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Assessment failed');
  return res.json();
}

export async function fetchSubsidies(state) {
  const res = await fetch(`${API_BASE}/api/subsidies/${encodeURIComponent(state)}`);
  if (!res.ok) throw new Error('Failed to fetch subsidies');
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/api/community/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchImpact() {
  const res = await fetch(`${API_BASE}/api/community/impact`);
  if (!res.ok) throw new Error('Failed to fetch impact');
  return res.json();
}

export async function registerRecharge(userName, location, rechargeLiters) {
  const res = await fetch(`${API_BASE}/api/community/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, location, rechargeLiters })
  });
  if (!res.ok) throw new Error('Failed to register recharge');
  return res.json();
}
