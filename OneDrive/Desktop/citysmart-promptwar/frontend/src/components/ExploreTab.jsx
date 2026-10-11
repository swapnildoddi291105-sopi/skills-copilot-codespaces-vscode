import FilterPanel from './FilterPanel.jsx';
import PlaceCard from './PlaceCard.jsx';
import Hero from './Hero.jsx';
import { CATEGORIES } from '../config/categories.js';
import { useApp } from '../App.jsx';

export default function ExploreTab({
  search,
  setSearch,
  category,
  setCategory,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  activeRadius,
  setActiveRadius,
  loading,
  onExploreClick,
}) {
  const { filteredPlaces, compareIds, toggleCompare, setSelectedPlace, dataSource, userLocation } = useApp();

  // Determine nearest place based on smallest distance_km
  let minDistance = Infinity;
  let nearestPlaceId = null;
  filteredPlaces.forEach((p) => {
    if (p.distance_km != null && p.distance_km < minDistance) {
      minDistance = p.distance_km;
      nearestPlaceId = p.id;
    }
  });

  return (
    <>
      {/* Hero Banner */}
      <Hero userLocation={userLocation} onExploreClick={onExploreClick} />

      {/* Floating Filter Panel */}
      <FilterPanel
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minRating={minRating}
        setMinRating={setMinRating}
        activeRadius={activeRadius}
        setActiveRadius={setActiveRadius}
        userLocation={userLocation}
        onSearch={onExploreClick}
        placesCount={filteredPlaces.length}
      />

      {/* 4 Feature Highlights with Honest Labels (Rule A.2) */}
      <section className="features-strip">
        <div className="feature-box">
          <div className="feature-icon-circle">🏷️</div>
          <div className="feature-meta">
            <h4>Best Local Value</h4>
            <p>Verified entry tariffs and transparent prices with zero markups.</p>
          </div>
        </div>
        <div className="feature-box">
          <div className="feature-icon-circle">🎧</div>
          <div className="feature-meta">
            <h4>AI place assistant</h4>
            <p>Prompt our assistant anytime for customized neighborhood routes.</p>
          </div>
        </div>
        <div className="feature-box">
          <div className="feature-icon-circle">🛡️</div>
          <div className="feature-meta">
            <h4>Open data, no sponsored listings</h4>
            <p>Open community telemetry from OpenStreetMap without paid rankings.</p>
          </div>
        </div>
        <div className="feature-box">
          <div className="feature-icon-circle">🎖️</div>
          <div className="feature-meta">
            <h4>Places from OpenStreetMap</h4>
            <p>Authentic historical forts, cultural gems, and neighborhood cafes.</p>
          </div>
        </div>
      </section>

      {/* Places Grid Header */}
      <div className="section-header" id="popular-places-heading">
        <div className="section-header-title">
          <h2 className="section-title">
            {category ? CATEGORIES.find(c => c.value === category)?.label : 'Explore Places'}
          </h2>
          <span className="section-subtitle-cursive">in {userLocation?.name?.split(',')[0] || 'City'}</span>
        </div>
        <button
          className="section-link-btn"
          onClick={() => { setSearch(''); setCategory(''); setMaxPrice(''); setMinRating(''); }}
        >
          <span>Clear Filters</span>
          <span>↺</span>
        </button>
      </div>

      {dataSource === 'unavailable' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '14px 18px', borderRadius: 14, marginBottom: 24, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span>
          <span>Live telemetry for this region is currently unavailable. Displaying cached points or try increasing your search radius.</span>
        </div>
      )}

      {loading ? (
        <div className="places-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="place-card skeleton" style={{ height: 320 }} />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No places match your filters</h3>
          <p>Try clearing your budget filter, increasing the search radius, or choosing another category.</p>
        </div>
      ) : (
        <div className="places-grid">
          {filteredPlaces.map((p) => (
            <PlaceCard
              key={p.id}
              place={p}
              isNearest={p.id === nearestPlaceId}
              checked={compareIds.has(p.id)}
              onToggle={() => toggleCompare(p.id)}
              onClick={() => setSelectedPlace(p)}
            />
          ))}
        </div>
      )}

      {/* Secondary Feature Section ("Why Choose Roamly?") */}
      <section className="secondary-feature-section">
        <div className="secondary-feature-left">
          <h3>Why Choose <span className="brand-text-cursive">Roamly?</span></h3>
          <div className="secondary-grid-2x2">
            <div className="feature-mini-card">
              <div className="feature-mini-icon">🌐</div>
              <h4>Wide Range of Choices</h4>
              <p>Explore heritage monuments, street eateries, and scenic overlooks.</p>
            </div>
            <div className="feature-mini-card">
              <div className="feature-mini-icon">👍</div>
              <h4>Open Data Transparency</h4>
              <p>Backed by community-reviewed coordinates and accurate opening hours.</p>
            </div>
            <div className="feature-mini-card">
              <div className="feature-mini-icon">⚖️</div>
              <h4>Side-by-Side Comparison</h4>
              <p>Select multiple destinations and compare ticket costs, ratings, and accessibility.</p>
            </div>
            <div className="feature-mini-card">
              <div className="feature-mini-icon">✨</div>
              <h4>Instant AI Answers</h4>
              <p>Natural language search that parses your budget and preferences.</p>
            </div>
          </div>
        </div>

        <div className="secondary-feature-card-banner">
          <div className="secondary-banner-content">
            <span className="secondary-banner-pill">CITY EXPLORER</span>
            <h4 className="secondary-banner-title">Your Next Adventure Awaits!</h4>
            <p className="secondary-banner-desc">
              Discover authentic places and culture with live OpenStreetMap telemetry.
            </p>
            <button className="secondary-banner-btn" onClick={onExploreClick}>
              <span>Explore Places</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Honest Demo Newsletter Strip (Rule A.4) */}
      <section className="newsletter-banner">
        <div className="newsletter-left">
          <div className="newsletter-icon-circle">📬</div>
          <div className="newsletter-meta">
            <h3>City Explorer Digest <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: 999, marginLeft: 8 }}>Demo</span></h3>
            <p>Newsletter subscription is for illustrative demo purposes only (no emails collected).</p>
          </div>
        </div>

        <div className="newsletter-right">
          <div className="newsletter-input-box" style={{ opacity: 0.85 }}>
            <input
              type="email"
              disabled
              placeholder="Demo only (submissions disabled)"
              aria-label="Demo newsletter input"
            />
            <button type="button" disabled className="newsletter-btn" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
              Disabled
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
