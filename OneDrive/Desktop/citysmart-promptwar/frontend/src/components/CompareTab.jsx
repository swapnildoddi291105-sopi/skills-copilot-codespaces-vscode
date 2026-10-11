import { useState, useEffect } from 'react';
import { useApp } from '../App.jsx';
import { postCompare } from '../api.js';

export default function CompareTab() {
  const { compareIds, toggleCompare } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (compareIds.size < 2) { setData(null); return; }
    setLoading(true);
    setError(null);
    postCompare({ ids: [...compareIds] })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [compareIds]);

  if (compareIds.size < 2) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚖️</div>
        <h3>Select at least 2 places to compare</h3>
        <p>Use the checkboxes on place cards in the Explore tab.</p>
      </div>
    );
  }

  if (loading) return <div className="skeleton" style={{ height: 300, width: '100%', borderRadius: 12 }}></div>;
  if (error) return <div className="empty-state"><h3>Error</h3><p>{error}</p></div>;
  if (!data) return null;

  return (
    <div className="compare-table-wrapper">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Attribute</th>
            {data.places.map((p) => (
              <th key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  {p.name}
                  <button className="compare-remove" onClick={() => toggleCompare(p.id)} title="Remove">✕</button>
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
  );
}
