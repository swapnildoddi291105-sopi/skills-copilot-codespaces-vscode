export default function LocationBar({ userLocation, onOpenModal, onUseMyLocation }) {
  return (
    <div className="location-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>📍</span>
        <span>Exploring near: <strong style={{ color: 'var(--navy)' }}>{userLocation?.name || '...'}</strong></span>
      </div>
      <div className="actions">
        <button onClick={onOpenModal}>Change city</button>
        <button onClick={onUseMyLocation} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> My location
        </button>
      </div>
    </div>
  );
}
