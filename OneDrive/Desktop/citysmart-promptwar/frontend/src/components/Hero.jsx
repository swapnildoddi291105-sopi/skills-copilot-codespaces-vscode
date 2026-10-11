export default function Hero({ userLocation, onExploreClick }) {
  const cityName = userLocation?.name?.split(',')[0] || 'your city';

  return (
    <section className="hero-container">
      <div className="hero-overlay-tint" />
      <div className="hero-content">
        <div className="hero-pill-tag">
          <span>✈</span>
          <span>EXPLORE. DREAM. DISCOVER.</span>
        </div>
        <h1 className="hero-title">
          Discover Amazing
          <span className="hero-title-highlight">Places with Us</span>
        </h1>
        <p className="hero-subtitle">
          Find the best heritage forts, local flavors, and cultural spots in {cityName}: everything you need for the perfect journey.
        </p>
        <button className="hero-cta-btn" onClick={onExploreClick}>
          <span>Explore Now</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
}
