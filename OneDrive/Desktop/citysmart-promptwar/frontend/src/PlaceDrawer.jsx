import { useState, useEffect } from 'react';
import { useApp } from './App.jsx';
import { fetchWikiSummary } from './api.js';

function Val({ value }) {
  if (value == null) return <span className="not-available">Not available</span>;
  return <>{String(value)}</>;
}

// Memory cache for fetched wikipedia summaries
const wikiCache = new Map();

export default function PlaceDrawer() {
  const { selectedPlace: place, setSelectedPlace, savedIds, toggleSave } = useApp();
  const [wikiData, setWikiData] = useState(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  useEffect(() => {
    if (!place?.wikipedia) {
      setWikiData(null);
      return;
    }
    const wikiKey = place.wikipedia;
    if (wikiCache.has(wikiKey)) {
      setWikiData(wikiCache.get(wikiKey));
      return;
    }
    setWikiLoading(true);
    fetchWikiSummary(wikiKey)
      .then((data) => {
        if (data && (data.extract || data.thumbnail)) {
          wikiCache.set(wikiKey, data);
          setWikiData(data);
        } else {
          setWikiData(null);
        }
      })
      .catch(() => setWikiData(null))
      .finally(() => setWikiLoading(false));
  }, [place?.wikipedia]);

  if (!place) return null;

  const isSaved = savedIds.has(place.id);

  return (
    <div className="drawer-overlay" onClick={() => setSelectedPlace(null)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{place.name}</h2>
          <button className="drawer-close" onClick={() => setSelectedPlace(null)}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Wikipedia Enrichment Block (Only if place has wikipedia tag and data returned) */}
          {wikiData && (wikiData.extract || wikiData.thumbnail) && (
            <div className="drawer-section wikipedia-enrichment-card" style={{
              background: '#F0F7FF',
              border: '1px solid #BFDBFE',
              borderRadius: 14,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#1D4ED8' }}>
                  Source: Wikipedia
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Verified Encyclopedia</span>
              </div>
              {wikiData.thumbnail && (
                <div style={{ width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', background: '#E2E8F0' }}>
                  <img
                    src={wikiData.thumbnail}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              )}
              {wikiData.extract && (
                <p style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.55 }}>
                  {wikiData.extract}
                </p>
              )}
            </div>
          )}

          <div className="drawer-section">
            <span className="drawer-section-label">Category</span>
            <span className={`category-badge ${place.category}`}>{place.category}</span>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-label">Area</span>
            <span className="drawer-section-value">{place.area}</span>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-label">Description</span>
            <span className="drawer-section-value"><Val value={place.description} /></span>
          </div>

          {place.historical_facts && (
            <div className="drawer-section">
              <span className="drawer-section-label">Historical Facts</span>
              <span className="drawer-section-value">{place.historical_facts}</span>
            </div>
          )}

          <div className="drawer-section">
            <span className="drawer-section-label">Price</span>
            <span className="drawer-section-value">
              {place.price_inr != null ? (
                <>₹{place.price_inr}{place.price_note && <> — {place.price_note}</>}</>
              ) : (
                <span className="not-available">Not available</span>
              )}
            </span>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-label">Rating</span>
            <span className="drawer-section-value">
              {place.rating != null ? `⭐ ${place.rating}` : <span className="not-available">Not available</span>}
            </span>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-label">Opening Hours</span>
            <span className="drawer-section-value"><Val value={place.hours} /></span>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-label">Accessibility</span>
            <span className="drawer-section-value"><Val value={place.accessibility} /></span>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-label">Cleanliness</span>
            <span className="drawer-section-value"><Val value={place.cleanliness} /></span>
          </div>

          <div className="metadata-box">
            <div className="metadata-row">
              <span className="metadata-label">Source</span>
              <span className="metadata-val"><Val value={place.source} /></span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">Last Verified</span>
              <span className="metadata-val"><Val value={place.last_verified} /></span>
            </div>
          </div>

          {place.distance_km != null && (
            <div className="drawer-section">
              <span className="drawer-section-label">Distance</span>
              <span className="drawer-section-value">{place.distance_km} km</span>
            </div>
          )}
        </div>

        <div className="drawer-actions">
          <a
            className="btn btn-primary"
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🧭 Open Directions
          </a>
          <button
            className={`btn ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleSave(place.id)}
          >
            {isSaved ? '❤️ Saved' : '🤍 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
