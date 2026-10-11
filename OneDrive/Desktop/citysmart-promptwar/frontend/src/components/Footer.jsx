export default function Footer({ onTabChange, onCategoryChange }) {
  return (
    <footer className="footer-container">
      <div className="footer-top">
        <div className="footer-brand">
          <h4>
            <div className="navbar-brand-logo" style={{ width: 32, height: 32 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            Roamly
          </h4>
          <p>
            Your intelligent city discovery companion. Open data from OpenStreetMap, authentic local culture, and zero sponsored rankings.
          </p>
        </div>
        <div className="footer-col">
          <h5>Discover</h5>
          <ul>
            <li><a href="#places" onClick={(e) => { e.preventDefault(); onTabChange('Explore'); }}>Explore Places</a></li>
            <li><a href="#map" onClick={(e) => { e.preventDefault(); onTabChange('Map'); }}>Interactive Map</a></li>
            <li><a href="#assistant" onClick={(e) => { e.preventDefault(); onTabChange('AI Assistant'); }}>AI Assistant</a></li>
            <li><a href="#compare" onClick={(e) => { e.preventDefault(); onTabChange('Compare'); }}>Side-by-side Compare</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Categories</h5>
          <ul>
            <li><a href="#historical" onClick={(e) => { e.preventDefault(); onCategoryChange('historical'); onTabChange('Explore'); }}>Historical Forts</a></li>
            <li><a href="#attractions" onClick={(e) => { e.preventDefault(); onCategoryChange('attraction'); onTabChange('Explore'); }}>Must-Visit Spots</a></li>
            <li><a href="#food" onClick={(e) => { e.preventDefault(); onCategoryChange('restaurant'); onTabChange('Explore'); }}>Local Eateries</a></li>
            <li><a href="#cafes" onClick={(e) => { e.preventDefault(); onCategoryChange('cafe'); onTabChange('Explore'); }}>Cozy Cafes</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Data Transparency</h5>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Powered by OpenStreetMap live telemetry, Open-Meteo climate records, and local datasets. Missing values are displayed as &quot;Not available&quot;.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} Roamly Explorer. Open-source student project.</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>API Docs</span>
        </div>
      </div>
    </footer>
  );
}
