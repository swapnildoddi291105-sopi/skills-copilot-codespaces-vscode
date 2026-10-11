// Mock data layer – returns data in the exact shapes from API.md
// Activated when VITE_USE_MOCK=true

const PLACES = [
  {
    id: 'shaniwar-wada',
    name: 'Shaniwar Wada',
    category: 'historical',
    lat: 18.5196,
    lng: 73.8553,
    description: 'Majestic 7-story fort palace built in 1732 by Peshwa Baji Rao I, seat of the Peshwas of the Maratha Empire.',
    historical_facts: 'Built in 1732 as the seat of the Peshwas. Survived a major fire in 1828 that destroyed most of the upper floors.',
    price_inr: 25,
    price_note: 'Entry fee for Indian nationals; foreign nationals ₹300',
    rating: 4.4,
    hours: '08:00 AM – 06:30 PM',
    accessibility: 'Partial wheelchair accessibility at ground level',
    cleanliness: 'Well maintained heritage grounds',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Shaniwar Peth',
    distance_km: null,
    wikipedia: 'Shaniwar_Wada',
  },
  {
    id: 'aga-khan-palace',
    name: 'Aga Khan Palace',
    category: 'historical',
    lat: 18.5525,
    lng: 73.9015,
    description: 'A majestic palace built in 1892 by Sultan Muhammed Shah Aga Khan III. It served as a prison for Mahatma Gandhi during the Quit India Movement.',
    historical_facts: 'Mahatma Gandhi, Kasturba Gandhi, and Mahadev Desai were imprisoned here from 1942–1944. Now a memorial managed by the Gandhi National Memorial Society.',
    price_inr: 25,
    price_note: 'Entry fee for Indian nationals; foreign nationals ₹300',
    rating: 4.5,
    hours: '09:00 AM – 05:30 PM',
    accessibility: 'Wheelchair accessible ramps',
    cleanliness: 'Very clean garden grounds',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Kalyani Nagar',
    distance_km: null,
    wikipedia: 'Aga_Khan_Palace',
  },
  {
    id: 'sinhagad-fort',
    name: 'Sinhagad Fort',
    category: 'historical',
    lat: 18.3664,
    lng: 73.7557,
    description: 'An ancient hill fortress located about 35 km southwest of Pune. Famous for the Battle of Sinhagad in 1670.',
    historical_facts: 'Originally called Kondhana, renamed Sinhagad after Tanaji Malusare\'s heroic battle in 1670 to recapture it for the Maratha Empire.',
    price_inr: null,
    price_note: null,
    rating: 4.6,
    hours: '06:00 AM – 06:00 PM',
    accessibility: 'Not wheelchair accessible – steep trek required',
    cleanliness: 'Moderate – food stalls on summit',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Sinhagad Road',
    distance_km: null,
    wikipedia: 'Sinhagad',
  },
  {
    id: 'dagdusheth-ganpati',
    name: 'Dagdusheth Halwai Ganpati',
    category: 'attraction',
    lat: 18.5168,
    lng: 73.8563,
    description: 'One of the most famous Ganesh temples in Pune, established in 1893 by Dagdusheth Halwai.',
    historical_facts: 'Founded by sweetmaker Dagdusheth Halwai in memory of his son who died of plague. The gold-plated idol weighs 40 kg.',
    price_inr: 0,
    price_note: 'Free entry',
    rating: 4.7,
    hours: '06:00 AM – 10:00 PM',
    accessibility: 'Wheelchair accessible ground floor',
    cleanliness: 'Very well maintained',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Budhwar Peth',
    distance_km: null,
  },
  {
    id: 'vaishali-restaurant',
    name: 'Vaishali Restaurant',
    category: 'restaurant',
    lat: 18.5167,
    lng: 73.8425,
    description: 'Iconic South Indian restaurant in Pune, famous for its dosa, idli, and filter coffee since 1951.',
    historical_facts: null,
    price_inr: 250,
    price_note: 'Meal for one person',
    rating: 4.3,
    hours: '07:00 AM – 10:30 PM',
    accessibility: 'Ground floor accessible',
    cleanliness: 'Clean and well-maintained',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'FC Road, Deccan',
    distance_km: null,
  },
  {
    id: 'german-bakery',
    name: 'German Bakery',
    category: 'cafe',
    lat: 18.5369,
    lng: 73.8935,
    description: 'A beloved Pune bakery and café known for pastries, whole wheat breads, and continental dishes in a garden setting.',
    historical_facts: null,
    price_inr: 400,
    price_note: 'Meal with coffee for one',
    rating: 4.1,
    hours: '08:00 AM – 11:00 PM',
    accessibility: 'Wheelchair accessible',
    cleanliness: 'Well maintained garden seating',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Koregaon Park',
    distance_km: null,
  },
  {
    id: 'jw-marriott-pune',
    name: 'JW Marriott Hotel Pune',
    category: 'hotel',
    lat: 18.5356,
    lng: 73.9081,
    description: 'Five-star luxury hotel in Senapati Bapat Road with premium rooms, multiple dining options, spa, and pool.',
    historical_facts: null,
    price_inr: 8500,
    price_note: 'Starting room rate per night',
    rating: 4.6,
    hours: 'Open 24 hours',
    accessibility: 'Fully wheelchair accessible',
    cleanliness: 'Excellent – 5-star standard',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Senapati Bapat Road',
    distance_km: null,
  },
  {
    id: 'goodluck-cafe',
    name: 'Goodluck Café',
    category: 'cafe',
    lat: 18.5129,
    lng: 73.8434,
    description: 'An iconic Irani café operating since 1935, known for bun-maska, chai, and omelettes.',
    historical_facts: null,
    price_inr: 120,
    price_note: 'Snack with tea for one',
    rating: 4.2,
    hours: '07:00 AM – 11:30 PM',
    accessibility: 'Ground floor access only',
    cleanliness: 'Vintage charm, reasonably clean',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'FC Road, Deccan',
    distance_km: null,
  },
  {
    id: 'pataleshwar-cave',
    name: 'Pataleshwar Cave Temple',
    category: 'historical',
    lat: 18.5232,
    lng: 73.8461,
    description: 'Rock-cut cave temple dating back to the 8th century, carved from a single basalt rock and dedicated to Lord Shiva.',
    historical_facts: 'Built during the Rashtrakuta dynasty era (8th century). One of the few rock-cut temples in Maharashtra.',
    price_inr: 0,
    price_note: 'Free entry',
    rating: 4.0,
    hours: '08:30 AM – 05:30 PM',
    accessibility: 'Limited – uneven rock surfaces',
    cleanliness: 'ASI maintained, moderate',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Jangali Maharaj Road',
    distance_km: null,
  },
  {
    id: 'kayani-bakery',
    name: 'Kayani Bakery',
    category: 'cafe',
    lat: 18.5214,
    lng: 73.8688,
    description: 'Legendary Irani bakery since 1955, most famous for its Shrewsbury biscuits that draw queues from across the city.',
    historical_facts: null,
    price_inr: 80,
    price_note: 'Biscuits and snacks',
    rating: 4.3,
    hours: '07:30 AM – 01:00 PM, 03:30 PM – 09:00 PM',
    accessibility: 'Ground floor only',
    cleanliness: 'Clean traditional bakery',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'East Street, Camp',
    distance_km: null,
  },
  {
    id: 'osho-garden',
    name: 'Osho Teerth Park (Zen Garden)',
    category: 'attraction',
    lat: 18.5343,
    lng: 73.8937,
    description: 'A serene 12-acre garden of stone pathways, bridges, waterfalls, and lush greenery – an oasis of calm in Koregaon Park.',
    historical_facts: null,
    price_inr: 0,
    price_note: 'Free entry',
    rating: 4.4,
    hours: '06:00 AM – 06:00 PM',
    accessibility: 'Mostly wheelchair accessible paths',
    cleanliness: 'Very well maintained gardens',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Koregaon Park',
    distance_km: null,
  },
  {
    id: 'pune-okayama-garden',
    name: 'Pune-Okayama Friendship Garden',
    category: 'attraction',
    lat: 18.4998,
    lng: 73.8104,
    description: 'Japanese-style garden also known as Pu La Deshpande Garden, featuring ponds, musical fountain, and bamboo groves.',
    historical_facts: null,
    price_inr: 10,
    price_note: 'Nominal entry fee',
    rating: 4.3,
    hours: '06:00 AM – 10:00 AM, 04:00 PM – 08:00 PM',
    accessibility: 'Mostly wheelchair accessible',
    cleanliness: 'Well maintained by PMC',
    source: 'Seed data (unverified)',
    last_verified: '2026-10-09',
    area: 'Sinhagad Road',
    distance_km: null,
  },
];

// Haversine distance helper (km)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withDistance(place, lat, lng) {
  if (lat == null || lng == null) return place;
  return { ...place, distance_km: +haversine(place.lat, place.lng, lat, lng).toFixed(1) };
}

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchPlaces(params = {}) {
  await delay();
  let results = PLACES.map((p) => withDistance(p, params.lat, params.lng));

  if (params.q) {
    const q = params.q.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q)
    );
  }
  if (params.category) {
    results = results.filter((p) => p.category === params.category);
  }
  if (params.max_price != null) {
    results = results.filter((p) => {
      if (p.price_inr == null) return params.include_unknown_price === true;
      return p.price_inr <= params.max_price;
    });
  }
  if (params.min_rating != null) {
    results = results.filter((p) => p.rating != null && p.rating >= params.min_rating);
  }
  if (params.max_distance_km != null && params.lat != null) {
    results = results.filter((p) => p.distance_km != null && p.distance_km <= params.max_distance_km);
  }
  if (params.lat != null) {
    results.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
  }
  return { places: results };
}

export async function fetchPlace(id) {
  await delay();
  const p = PLACES.find((pl) => pl.id === id);
  if (!p) throw new Error('Place not found');
  return p;
}

export async function postAssistant({ message, user_location }) {
  await delay(600);
  const lower = message.toLowerCase();
  let category = null;
  let max_price = null;
  let min_rating = null;
  const keywords = [];

  if (lower.includes('historical')) { category = 'historical'; keywords.push('historical'); }
  else if (lower.includes('cafe') || lower.includes('café')) { category = 'cafe'; keywords.push('cafe'); }
  else if (lower.includes('restaurant')) { category = 'restaurant'; keywords.push('restaurant'); }
  else if (lower.includes('hotel')) { category = 'hotel'; keywords.push('hotel'); }
  else if (lower.includes('attraction')) { category = 'attraction'; keywords.push('attraction'); }

  const priceMatch = lower.match(/under\s*₹?\s*(\d+)/);
  if (priceMatch) max_price = parseInt(priceMatch[1]);

  const ratingMatch = lower.match(/(?:rated?|rating)\s*(?:above|over|>)?\s*(\d\.?\d?)/);
  if (ratingMatch) min_rating = parseFloat(ratingMatch[1]);

  if (lower.includes('pune')) keywords.push('pune');
  if (lower.includes('affordable')) keywords.push('affordable');
  if (lower.includes('best')) keywords.push('best');
  if (lower.includes('near')) keywords.push('near');

  const { places: all } = await fetchPlaces({
    category,
    max_price,
    min_rating,
    include_unknown_price: true,
    lat: user_location?.lat,
    lng: user_location?.lng,
  });
  const places = all.slice(0, 5);
  const names = places.map((p) => p.name).join(', ');
  const explanation = places.length
    ? `I found ${places.length} ${category || ''} places${max_price ? ` under ₹${max_price}` : ''} in Pune: ${names}. ${places[0].description}`
    : `I couldn't find any places matching your criteria. Try broadening your search.`;

  return {
    filters: {
      category,
      max_price,
      min_rating,
      keywords,
      max_distance_km: null,
    },
    places,
    explanation,
  };
}

export async function postCompare({ ids }) {
  await delay();
  if (!ids || ids.length < 2) throw new Error('At least 2 place IDs required for comparison');
  const places = ids.map((id) => PLACES.find((p) => p.id === id)).filter(Boolean);

  const fieldRows = [
    { field: 'price_inr', label: 'Price (INR)' },
    { field: 'rating', label: 'Rating' },
    { field: 'distance_km', label: 'Distance (km)' },
    { field: 'hours', label: 'Opening Hours' },
    { field: 'accessibility', label: 'Accessibility' },
    { field: 'cleanliness', label: 'Cleanliness' },
    { field: 'source', label: 'Source' },
    { field: 'last_verified', label: 'Last Verified' },
  ];

  const rows = fieldRows.map(({ field, label }) => ({
    field,
    label,
    values: Object.fromEntries(places.map((p) => [p.id, p[field] ?? null])),
  }));

  return { places, rows };
}

export async function fetchWeather() {
  await delay(200);
  return {
    temperature_c: 28.5,
    condition: 'Partly cloudy',
    source: 'Open-Meteo',
    fetched_at: new Date().toISOString(),
  };
}

export async function fetchAirQuality() {
  await delay(200);
  return {
    us_aqi: 110,
    european_aqi: 75,
    pm2_5: 28.5,
    category: 'Moderate',
    source: 'Open-Meteo',
    fetched_at: new Date().toISOString(),
  };
}

export async function fetchTrafficEstimate() {
  await delay(150);
  return {
    level: 'Moderate',
    score: 50,
    label: 'Estimated',
    basis: 'Standard daytime traffic based on local time window',
    local_hour_approx: 14,
    fetched_at: new Date().toISOString(),
  };
}

export async function fetchGeocode({ q }) {
  await delay(300);
  const lower = q.toLowerCase();
  if (lower.includes('mumbai')) {
    return { name: "Mumbai, Maharashtra, India", lat: 19.0760, lng: 72.8777 };
  }
  if (lower.includes('delhi')) {
    return { name: "New Delhi, Delhi, India", lat: 28.6139, lng: 77.2090 };
  }
  if (lower.includes('pune')) {
    return { name: "Pune, Maharashtra, India", lat: 18.5204, lng: 73.8567 };
  }
  throw new Error("City not found");
}
