import { CATEGORY_EMOJIS } from '../config/categories.js';

export default function PlaceCard({ place, isNearest = false, checked, onToggle, onClick }) {
  const isLive = place.source && place.source.toLowerCase().includes('openstreetmap');

  // Honest Data-Driven Badges (Rule A.1):
  // "Top rated" (rating >= 4.5, when rating exists)
  // "Free" (price 0)
  // "Nearest" (smallest distance)
  // "Heritage" (historical category)
  let honestBadge = null;
  let honestBadgeClass = '';

  if (place.rating != null && place.rating >= 4.5) {
    honestBadge = 'Top rated';
    honestBadgeClass = 'top-rated';
  } else if (place.price_inr === 0) {
    honestBadge = 'Free';
    honestBadgeClass = 'free';
  } else if (isNearest && place.distance_km != null) {
    honestBadge = 'Nearest';
    honestBadgeClass = 'nearest';
  } else if (place.category === 'historical') {
    honestBadge = 'Heritage';
    honestBadgeClass = 'heritage';
  }

  const categoryEmoji = CATEGORY_EMOJIS[place.category] || '📍';

  return (
    <div className="place-card" onClick={onClick}>
      {/* Category Icon Header (Honest illustration / No fake stock photo) */}
      <div className="place-card-image-wrap place-card-honest-header">
        <div className="place-card-category-visual">
          <span className="place-card-category-glyph">{categoryEmoji}</span>
          <span className="place-card-illustrative-tag">Category Visual</span>
        </div>
        {honestBadge && (
          <span className={`card-top-badge ${honestBadgeClass}`}>
            {honestBadge}
          </span>
        )}
      </div>

      <div className="place-card-body">
        <div className="place-card-header">
          <h3 className="place-card-name">{place.name}</h3>
          <div className="card-badges">
            <span className={`category-badge ${place.category}`}>{place.category}</span>
            <span className={`source-badge ${isLive ? 'live' : 'demo'}`}>
              {isLive ? 'Live: OpenStreetMap' : 'Demo data'}
            </span>
          </div>
        </div>

        {/* Location & Price row: Missing values must show "Not available" */}
        <div className="place-card-details">
          <div className="place-card-loc">
            <span>📍</span>
            <span>{place.area || <span className="not-available">Not available</span>}</span>
          </div>
          <div className="place-card-price-tag">
            <span className="place-card-price-label">Price</span>
            <span className="place-card-price-value">
              {place.price_inr === 0 ? 'Free' : place.price_inr != null ? `₹${place.price_inr}` : <span className="not-available" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Not available</span>}
            </span>
          </div>
        </div>

        <div className="place-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>
            <span>⭐</span>
            <span>{place.rating != null ? place.rating : <span className="not-available" style={{ fontWeight: 400 }}>Not available</span>}</span>
            {place.distance_km != null ? (
              <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontWeight: 400 }}>
                · {place.distance_km} km
              </span>
            ) : null}
          </div>
          <label className="compare-check" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={checked || false}
              onChange={onToggle}
            />
            Compare
          </label>
        </div>
      </div>
    </div>
  );
}
