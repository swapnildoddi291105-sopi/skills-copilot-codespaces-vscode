import { useState, useCallback, useEffect } from 'react';
import { fetchGeocode } from '../api.js';

export default function LocationModal({ onClose, onSelect }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSearch = useCallback(async (query) => {
    const searchStr = query != null ? query : q;
    if (!searchStr.trim()) return;
    setLoading(true); setErr('');
    try {
      const res = await fetchGeocode({ q: searchStr });
      if (res && res.lat) {
        onSelect(res);
        onClose();
      } else {
        setErr('City not found.');
      }
    } catch (e) {
      setErr('City not found or network error occurred.');
    } finally {
      setLoading(false);
    }
  }, [q, onSelect, onClose]);

  // Debounced search on input change (300ms)
  useEffect(() => {
    if (!q.trim() || q.trim().length < 3) return;
    const timer = setTimeout(() => {
      handleSearch(q);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, handleSearch]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Change Location</h3>
        <input 
          autoFocus
          placeholder="Enter city name (e.g., Tokyo, Paris, Mumbai)..." 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {err && <p style={{color: '#EF4444', fontSize: '0.8rem', marginTop: 6, marginBottom: 10}}>{err}</p>}
        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => handleSearch()}>{loading ? 'Searching...' : 'Search'}</button>
        </div>
      </div>
    </div>
  );
}
