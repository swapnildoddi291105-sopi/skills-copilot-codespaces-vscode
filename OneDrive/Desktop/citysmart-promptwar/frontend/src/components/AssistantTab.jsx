import { useState } from 'react';
import { useApp } from '../App.jsx';
import { postAssistant } from '../api.js';
import PlaceCard from './PlaceCard.jsx';

const SUGGESTED_PROMPTS = [
  'Find historical places nearby under ₹500',
  'Suggest three affordable cafes in the area',
  'Best rated attractions nearby',
];

export default function AssistantTab() {
  const { setFilteredPlaces, setSelectedPlace, userLocation, setUserLocation, compareIds, toggleCompare } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    setLastPrompt(msg);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const data = await postAssistant({
        message: msg,
        user_location: userLocation,
      });

      // Update places list & map pins when assistant returns places (Rule C.2)
      if (data.places?.length) {
        setFilteredPlaces(data.places);
      }

      // If resolved location returned by backend has coordinates, update map center
      if (data.location?.lat && data.location?.lng && data.location?.name && data.location.name !== userLocation?.name) {
        setUserLocation(data.location);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.explanation,
          places: data.places || [],
          location: data.location,
          filters: data.filters,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to complete request: ${e.message}`,
          isError: true,
          places: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-container">
      <div className="prompt-chips">
        {SUGGESTED_PROMPTS.map((p) => (
          <button key={p} className="prompt-chip" onClick={() => send(p)}>💡 {p}</button>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          id="assistant-input"
          type="text"
          placeholder="Ask me about places near you or in any city..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary" onClick={() => send()} disabled={loading}>
          {loading ? 'Searching...' : 'Send'}
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {/* Resolved Location Banner (Rule C.1) */}
            {m.location?.name && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#EAF3FF',
                color: '#0863C5',
                padding: '4px 10px',
                borderRadius: 9999,
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: 8,
              }}>
                <span>📍</span>
                <span>Searched in: {m.location.name}</span>
              </div>
            )}

            <div>{m.content}</div>

            {/* Error or Empty state with suggestions & retry button (Rule C.3) */}
            {m.isError && (
              <div style={{ marginTop: 10 }}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={() => send(lastPrompt)}
                >
                  🔄 Retry
                </button>
              </div>
            )}

            {/* Empty matching places suggestions (Rule C.3) */}
            {m.role === 'assistant' && !m.isError && (!m.places || m.places.length === 0) && (
              <div style={{
                marginTop: 12,
                padding: 12,
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px dashed #CBD5E1',
                fontSize: '0.85rem',
                color: '#475569',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>💡 Suggestions to loosen filters:</div>
                <ul style={{ paddingLeft: 18, lineHeight: 1.5 }}>
                  <li>Try asking without a strict budget limit or expand your radius.</li>
                  <li>Check city spelling (e.g., &quot;cafes in Mumbai&quot; or &quot;museums in London&quot;).</li>
                  <li>Search for broader categories such as attractions or historical sites.</li>
                </ul>
              </div>
            )}

            {/* Filters Understood metadata */}
            {m.filters && (
              <div className="filters-understood">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 4, fontWeight: 500 }}>
                  Filters understood:
                </span>
                {m.filters.category && <span className="filter-tag">Category: {m.filters.category}</span>}
                {m.filters.city && <span className="filter-tag">City: {m.filters.city}</span>}
                {m.filters.max_price != null && <span className="filter-tag">Max Price: ₹{m.filters.max_price}</span>}
                {m.filters.min_rating != null && <span className="filter-tag">Min Rating: {m.filters.min_rating}</span>}
                {m.filters.keywords?.length > 0 && <span className="filter-tag">Keywords: {m.filters.keywords.join(', ')}</span>}
              </div>
            )}

            {/* Recommended Places: Clicking opens details drawer & map pins updated (Rule C.2) */}
            {m.places?.length > 0 && (
              <div className="places-grid" style={{ marginTop: 16 }}>
                {m.places.map((p) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    checked={compareIds.has(p.id)}
                    onToggle={() => toggleCompare(p.id)}
                    onClick={() => setSelectedPlace(p)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Cold-start delay indicator: "Waking up the server" (Rule C.3) */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            <div className="loading-dots">
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Waking up the server & parsing filters...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
