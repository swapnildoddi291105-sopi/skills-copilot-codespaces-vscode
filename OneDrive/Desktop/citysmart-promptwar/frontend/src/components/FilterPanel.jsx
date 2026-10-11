import { CATEGORIES } from '../config/categories.js';

export default function FilterPanel({
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
  userLocation,
  onSearch,
  placesCount,
}) {
  return (
    <div className="floating-search-card">
      {/* Category Pills inside Filter */}
      <div className="filter-category-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`filter-cat-btn ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* 4 Inputs Row + Search Button */}
      <div className="floating-search-grid">
        {/* Destination / Search */}
        <div className="search-field-box">
          <span className="search-field-label">Keyword / Place</span>
          <div className="search-field-input-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              id="search-input"
              className="search-field-input"
              type="text"
              placeholder="Where to? (e.g., Wada, Cafe, Garden)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Location Area */}
        <div className="search-field-box">
          <span className="search-field-label">Near City / Area</span>
          <div className="search-field-input-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            <input
              className="search-field-input"
              type="text"
              readOnly
              value={userLocation?.name || 'Locating...'}
              style={{ cursor: 'pointer' }}
              title="Use location bar above to switch city"
            />
          </div>
        </div>

        {/* Budget Limit */}
        <div className="search-field-box">
          <span className="search-field-label">Max Budget (₹)</span>
          <div className="search-field-input-row">
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>₹</span>
            <input
              id="budget-input"
              className="search-field-input"
              type="number"
              min="0"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="search-field-box">
          <span className="search-field-label">Min Rating</span>
          <div className="search-field-input-row">
            <span style={{ color: '#F59E0B' }}>⭐</span>
            <select
              className="search-field-input"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Any</option>
              <option value="3">3+ Stars</option>
              <option value="3.5">3.5+</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button className="search-action-btn" onClick={onSearch}>
          <span>Search</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>

      {/* Quick Filter Radius Bar */}
      <div className="quick-filter-strip">
        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>Radius Range:</span>
        <div className="radius-pills">
          {[1, 3, 5, 10, 20].map((r) => (
            <button
              key={r}
              className={`radius-pill ${activeRadius === r ? 'active' : ''}`}
              onClick={() => setActiveRadius(r)}
            >
              {r} km
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {placesCount} verified places
        </span>
      </div>
    </div>
  );
}
