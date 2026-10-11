import { useState, useEffect } from 'react';
import { fetchAirQuality, fetchTrafficEstimate } from '../api.js';

export default function HomeTab({ weather, userLocation, onNavigateTab }) {
  const [aqiData, setAqiData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const lat = userLocation?.lat || 18.5204;
      const lng = userLocation?.lng || 73.8567;
      const [aqiRes, trafficRes] = await Promise.all([
        fetchAirQuality({ lat, lng }).catch((err) => ({
          us_aqi: null,
          category: 'Not available',
          source: 'Open-Meteo',
          fetched_at: new Date().toISOString(),
          error: true,
        })),
        fetchTrafficEstimate({ lat, lng }).catch((err) => ({
          level: 'Not available',
          label: 'Estimated',
          basis: 'Error retrieving estimate',
          score: null,
          fetched_at: new Date().toISOString(),
          error: true,
        })),
      ]);
      setAqiData(aqiRes);
      setTrafficData(trafficRes);
    } catch (err) {
      setError('Unable to load live environmental indicators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userLocation?.lat, userLocation?.lng]);

  // Compute Roamly Pulse (0-100) from available inputs
  const computePulse = () => {
    const inputsUsed = [];
    let totalScore = 0;
    let weightSum = 0;

    // 1. Weather comfort (Ideal ~ 22C, scale down as temp deviates)
    if (weather && weather.temperature_c != null) {
      inputsUsed.push('Weather Comfort');
      const temp = weather.temperature_c;
      // 22C -> 100, 35C -> 50, 45C -> 10
      const comfortScore = Math.max(10, Math.min(100, 100 - Math.abs(temp - 22) * 4));
      totalScore += comfortScore * 1.0;
      weightSum += 1.0;
    }

    // 2. Air quality (AQI 0-50 -> 100, 100 -> 70, 200 -> 30, 300+ -> 10)
    const rawAqi = aqiData?.us_aqi ?? aqiData?.european_aqi;
    if (rawAqi != null && !aqiData?.error) {
      inputsUsed.push('Air Quality');
      let aqiScore = 100;
      if (rawAqi <= 50) aqiScore = 100 - (rawAqi / 50) * 15; // 85-100
      else if (rawAqi <= 100) aqiScore = 85 - ((rawAqi - 50) / 50) * 25; // 60-85
      else if (rawAqi <= 200) aqiScore = 60 - ((rawAqi - 100) / 100) * 35; // 25-60
      else aqiScore = Math.max(5, 25 - ((rawAqi - 200) / 100) * 20);
      totalScore += aqiScore * 1.2;
      weightSum += 1.2;
    }

    // 3. Traffic pace (Light -> 90, Moderate -> 65, Heavy -> 35)
    if (trafficData && trafficData.score != null && !trafficData?.error) {
      inputsUsed.push('Traffic Flow');
      const flowScore = Math.max(10, 100 - (trafficData.score || 50));
      totalScore += flowScore * 0.8;
      weightSum += 0.8;
    }

    if (weightSum === 0) {
      return { pulse: null, confidence: 'None', inputsUsed: [] };
    }

    const finalPulse = Math.round(totalScore / weightSum);
    let confidence = 'Low';
    if (inputsUsed.length === 3) confidence = 'High';
    else if (inputsUsed.length === 2) confidence = 'Medium';

    return { pulse: finalPulse, confidence, inputsUsed };
  };

  const { pulse, confidence, inputsUsed } = computePulse();

  const formatTime = (iso) => {
    if (!iso) return 'Not available';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Not available';
    }
  };

  return (
    <div className="home-dashboard-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#102440', margin: 0 }}>
          City Dashboard
        </h1>
        <p style={{ color: '#64748B', margin: '6px 0 0', fontSize: '0.95rem' }}>
          Real-time conditions, environmental metrics, and quick actions for{' '}
          <strong style={{ color: '#0863C5' }}>{userLocation?.name || 'Pune, Maharashtra'}</strong>
        </p>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #F87171', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#991B1B', fontSize: '0.9rem' }}>⚠️ {error}</span>
          <button onClick={loadData} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* Top Section: Roamly Pulse Highlight */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', padding: '24px 28px', boxShadow: '0 4px 20px rgba(16,36,64,0.04)', marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF3FF', color: '#0863C5', padding: '4px 12px', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 700, marginBottom: 10 }}>
            <span>⚡</span> ROAMLY PULSE INDICATOR
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#102440', margin: '4px 0 8px' }}>
            City Livability & Activity Index
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 12px', lineHeight: 1.5 }}>
            Computed dynamically from available environmental indicators.
          </p>
          <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>
              <strong>Inputs Used:</strong>{' '}
              {inputsUsed.length > 0 ? inputsUsed.join(', ') : 'None available'}
            </div>
            <div>
              <strong>Confidence Level:</strong>{' '}
              <span style={{ fontWeight: 700, color: confidence === 'High' ? '#16A34A' : confidence === 'Medium' ? '#D97706' : '#94A3B8' }}>
                {confidence}
              </span>{' '}
              ({inputsUsed.length}/3 data feeds active)
            </div>
            <div style={{ fontStyle: 'italic', color: '#94A3B8', marginTop: 4 }}>
              * Pulse is an indicator, not an official score.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 36px', minWidth: 160 }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: pulse != null ? (pulse >= 70 ? '#0863C5' : pulse >= 45 ? '#D97706' : '#DC2626') : '#94A3B8', lineHeight: 1 }}>
            {pulse != null ? pulse : 'N/A'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginTop: 6 }}>
            {pulse != null ? (pulse >= 70 ? 'Optimal Activity' : pulse >= 45 ? 'Moderate Comfort' : 'Challenging') : 'Not available'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Score out of 100</span>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Card 1: Weather Now */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Weather</span>
              <span style={{ fontSize: '1.4rem' }}>🌤️</span>
            </div>
            {weather ? (
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#102440' }}>
                  {weather.temperature_c != null ? `${weather.temperature_c}°C` : 'Not available'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0863C5', marginTop: 4 }}>
                  {weather.condition || 'Not available'}
                </div>
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontStyle: 'italic', padding: '16px 0' }}>Loading weather...</div>
            )}
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginTop: 16, fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Source: {weather?.source || 'Open-Meteo'}</span>
            <span>{formatTime(weather?.fetched_at)}</span>
          </div>
        </div>

        {/* Card 2: Air Quality */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Air Quality (AQI)</span>
              <span style={{ fontSize: '1.4rem' }}>🍃</span>
            </div>
            {loading ? (
              <div style={{ color: '#94A3B8', fontStyle: 'italic', padding: '16px 0' }}>Fetching air quality data...</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#102440' }}>
                    {aqiData?.us_aqi != null ? aqiData.us_aqi : (aqiData?.european_aqi != null ? aqiData.european_aqi : 'Not available')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {aqiData?.us_aqi != null ? 'US AQI' : (aqiData?.european_aqi != null ? 'EU AQI' : '')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: aqiData?.category === 'Good' ? '#DCFCE7' : aqiData?.category === 'Moderate' ? '#FEF3C7' : '#FEE2E2',
                    color: aqiData?.category === 'Good' ? '#15803D' : aqiData?.category === 'Moderate' ? '#B45309' : '#B91C1C',
                  }}>
                    {aqiData?.category || 'Not available'}
                  </span>
                  {aqiData?.pm2_5 != null && (
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      PM2.5: {aqiData.pm2_5} µg/m³
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginTop: 16, fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Source: {aqiData?.source || 'Open-Meteo'}</span>
            <span>{formatTime(aqiData?.fetched_at)}</span>
          </div>
        </div>

        {/* Card 3: Traffic Mood */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Traffic Flow</span>
              <span style={{ fontSize: '1.4rem' }}>🚦</span>
            </div>
            {loading ? (
              <div style={{ color: '#94A3B8', fontStyle: 'italic', padding: '16px 0' }}>Calculating traffic model...</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#102440' }}>
                    {trafficData?.level || 'Not available'}
                  </span>
                  <span style={{ background: '#E2E8F0', color: '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>
                    {trafficData?.label || 'Estimated'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '8px 0 0', lineHeight: 1.4 }}>
                  {trafficData?.basis || 'Not available'}
                </p>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginTop: 16, fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Heuristic Model (Not live)</span>
            <span>{formatTime(trafficData?.fetched_at)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#102440', marginBottom: 14 }}>
          Quick Action Navigation
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Explore Places',
              desc: 'Browse verified attractions, restaurants, and cafes',
              icon: '🔍',
              tab: 'Explore',
              color: '#0863C5',
              bg: '#EAF3FF',
            },
            {
              title: 'Interactive Map',
              desc: 'View live spatial map with radius selection',
              icon: '🗺️',
              tab: 'Map',
              color: '#0D9488',
              bg: '#CCFBF1',
            },
            {
              title: 'AI Assistant',
              desc: 'Ask natural queries with smart grounded filters',
              icon: '✨',
              tab: 'AI Assistant',
              color: '#7C3AED',
              bg: '#EDE9FE',
            },
            {
              title: 'Compare Places',
              desc: 'Multi-attribute table and Recharts radar comparison',
              icon: '⚖️',
              tab: 'Compare',
              color: '#EA580C',
              bg: '#FFEDD5',
            },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => onNavigateTab(action.tab)}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '20px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(8,99,197,0.1)';
                e.currentTarget.style.borderColor = action.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: action.bg, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#102440', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{action.title}</span>
                  <span style={{ color: action.color, fontSize: '0.9rem' }}>→</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
                  {action.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
