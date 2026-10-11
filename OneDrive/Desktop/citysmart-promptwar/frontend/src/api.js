// API client – switches between mock and real backend based on VITE_USE_MOCK
import * as mock from './mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchPlaces(params = {}) {
  if (USE_MOCK) return mock.fetchPlaces(params);
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') qs.set(k, v);
  });
  return request(`/api/places?${qs}`);
}

export async function fetchPlace(id) {
  if (USE_MOCK) return mock.fetchPlace(id);
  return request(`/api/places/${id}`);
}

export async function postAssistant(body) {
  if (USE_MOCK) return mock.postAssistant(body);
  return request('/api/assistant', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function postCompare(body) {
  if (USE_MOCK) return mock.postCompare(body);
  return request('/api/compare', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchWeather(params = {}) {
  if (USE_MOCK) return mock.fetchWeather();
  const qs = new URLSearchParams();
  if (params.lat) qs.set('lat', params.lat);
  if (params.lng) qs.set('lng', params.lng);
  return request(`/api/weather?${qs}`);
}

export async function fetchGeocode(params = {}) {
  if (USE_MOCK) return mock.fetchGeocode(params);
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  return request(`/api/geocode?${qs}`);
}

export async function fetchWikiSummary(title) {
  if (!title) return null;
  const qs = new URLSearchParams({ title });
  return request(`/api/wiki-summary?${qs}`).catch(() => null);
}
