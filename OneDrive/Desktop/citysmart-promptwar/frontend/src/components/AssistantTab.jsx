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
  const { setFilteredPlaces, setSelectedPlace, userLocation, compareIds, toggleCompare } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const data = await postAssistant({
        message: msg,
        user_location: userLocation,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.explanation, places: data.places, filters: data.filters },
      ]);
      if (data.places?.length) setFilteredPlaces(data.places);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${e.message}`, places: [], filters: null },
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
          placeholder="Ask me about places near you..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary" onClick={() => send()}>Send</button>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.content}
            {m.filters && (
              <div className="filters-understood">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 4, fontWeight: 500 }}>Filters understood:</span>
                {m.filters.category && <span className="filter-tag">Category: {m.filters.category}</span>}
                {m.filters.max_price != null && <span className="filter-tag">Max Price: ₹{m.filters.max_price}</span>}
                {m.filters.min_rating != null && <span className="filter-tag">Min Rating: {m.filters.min_rating}</span>}
                {m.filters.keywords?.length > 0 && <span className="filter-tag">Keywords: {m.filters.keywords.join(', ')}</span>}
              </div>
            )}
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
        {loading && (
          <div className="loading-dots">
            <span className="skeleton" style={{width: 8, height: 8, borderRadius: '50%'}} />
            <span className="skeleton" style={{width: 8, height: 8, borderRadius: '50%'}} />
            <span className="skeleton" style={{width: 8, height: 8, borderRadius: '50%'}} />
          </div>
        )}
      </div>
    </div>
  );
}
