import { useState, useEffect, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useApp } from '../App.jsx';
import { postCompare } from '../api.js';

// Distinct colors for up to 4 places
const PLACE_COLORS = ['#0863C5', '#D97706', '#16A34A', '#DC2626'];

export default function CompareTab() {
  const { compareIds, toggleCompare } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (compareIds.size < 2) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    postCompare({ ids: [...compareIds] })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [compareIds]);

  // Compute Radar Chart data and notes (Strict Rule B.2 & B.3)
  const { chartData, excludedNotes, canShowRadar } = useMemo(() => {
    if (!data?.places || data.places.length < 2 || data.places.length > 4) {
      return { chartData: [], excludedNotes: [], canShowRadar: false };
    }

    const places = data.places;
    const notes = [];
    const validAxes = [];

    // Axis 1: Rating (0-5 scaled to 0-100)
    const missingRating = places.filter((p) => p.rating == null);
    if (missingRating.length > 0) {
      notes.push(`Not charted: Rating (missing for ${missingRating.map((p) => p.name).join(', ')})`);
    } else {
      validAxes.push({
        axis: 'Rating',
        computeScore: (p) => Math.round((Number(p.rating) / 5) * 100),
      });
    }

    // Axis 2: Affordability (inverse of price_inr, relative scaling)
    const missingPrice = places.filter((p) => p.price_inr == null);
    if (missingPrice.length > 0) {
      notes.push(`Not charted: Affordability (missing price for ${missingPrice.map((p) => p.name).join(', ')})`);
    } else {
      const prices = places.map((p) => Number(p.price_inr));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      validAxes.push({
        axis: 'Affordability',
        computeScore: (p) => {
          if (maxPrice === minPrice) return 100;
          const val = Number(p.price_inr);
          return Math.round(100 - ((val - minPrice) / (maxPrice - minPrice)) * 80);
        },
      });
    }

    // Axis 3: Proximity (inverse of distance_km, relative scaling)
    const missingDistance = places.filter((p) => p.distance_km == null);
    if (missingDistance.length > 0) {
      notes.push(`Not charted: Proximity (missing distance for ${missingDistance.map((p) => p.name).join(', ')})`);
    } else {
      const dists = places.map((p) => Number(p.distance_km));
      const minDist = Math.min(...dists);
      const maxDist = Math.max(...dists);

      validAxes.push({
        axis: 'Proximity',
        computeScore: (p) => {
          if (maxDist === minDist) return 100;
          const val = Number(p.distance_km);
          return Math.round(100 - ((val - minDist) / (maxDist - minDist)) * 80);
        },
      });
    }

    const canShow = validAxes.length >= 3;
    if (!canShow && validAxes.length > 0) {
      notes.push('Radar chart requires at least 3 complete numeric dimensions.');
    }

    const cData = validAxes.map(({ axis, computeScore }) => {
      const row = { metric: axis };
      places.forEach((p) => {
        row[p.id] = computeScore(p);
      });
      return row;
    });

    return { chartData: cData, excludedNotes: notes, canShowRadar: canShow };
  }, [data?.places]);

  if (compareIds.size < 2) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚖️</div>
        <h3>Select at least 2 places to compare</h3>
        <p>Use the checkboxes on place cards in the Explore tab.</p>
      </div>
    );
  }

  if (loading) return <div className="skeleton" style={{ height: 340, width: '100%', borderRadius: 16 }} />;
  if (error) return <div className="empty-state"><h3>Error</h3><p>{error}</p></div>;
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
      {/* Radar Chart Section (2 to 4 places, >= 3 numeric axes) */}
      {canShowRadar && (
        <div className="radar-chart-card" style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '24px 20px',
          boxShadow: '0 2px 8px rgba(16, 36, 64, 0.04)',
        }}>
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>Place Metric Radar</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Relative to the selected places
            </p>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#4A5D78', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} angle={30} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip formatter={(value) => [`${value} / 100`, 'Relative Score']} />
                <Legend formatter={(id) => data.places.find((p) => p.id === id)?.name || id} />
                {data.places.map((p, idx) => (
                  <Radar
                    key={p.id}
                    name={p.id}
                    dataKey={p.id}
                    stroke={PLACE_COLORS[idx % PLACE_COLORS.length]}
                    fill={PLACE_COLORS[idx % PLACE_COLORS.length]}
                    fillOpacity={0.25}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Excluded Notes Banner (Rule B.3) */}
      {excludedNotes.length > 0 && (
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '12px 18px',
          fontSize: '0.825rem',
          color: '#475569',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>Chart Notes & Data Coverage:</div>
          {excludedNotes.map((note, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>ℹ️</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Attribute</th>
              {data.places.map((p) => (
                <th key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span>{p.name}</span>
                    <button
                      className="compare-remove"
                      onClick={() => toggleCompare(p.id)}
                      title={`Remove ${p.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.field}>
                <td>{row.label}</td>
                {data.places.map((p) => (
                  <td key={p.id}>
                    {row.values[p.id] != null ? (
                      String(row.values[p.id])
                    ) : (
                      <span className="not-available">Not available</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
