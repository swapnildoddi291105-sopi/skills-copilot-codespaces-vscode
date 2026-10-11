import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { fetchPlaces, fetchWeather } from './api.js';
import MapView from './MapView.jsx';
import PlaceDrawer from './PlaceDrawer.jsx';
import LocationBar from './components/LocationBar.jsx';
import LocationModal from './components/LocationModal.jsx';
import ExploreTab from './components/ExploreTab.jsx';
import HomeTab from './components/HomeTab.jsx';
import AssistantTab from './components/AssistantTab.jsx';
import CompareTab from './components/CompareTab.jsx';
import Footer from './components/Footer.jsx';

// ===== App Context =====
const AppCtx = createContext();
export const useApp = () => useContext(AppCtx);

const TABS = ['Home', 'Explore', 'Map', 'AI Assistant', 'Compare'];

const TAB_ICONS = {
  Home: '🏠',
  Explore: '🔍',
  Map: '🗺️',
  'AI Assistant': '✨',
  Compare: '⚖️',
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedPlaces(key) {
  try {
    const raw = localStorage.getItem(`roamly_places_${key}`);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) return data;
  } catch (e) {
    return null;
  }
  return null;
}

function setCachedPlaces(key, data) {
  try {
    localStorage.setItem(`roamly_places_${key}`, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (e) {}
}

function getStoredFavorites() {
  try {
    const raw = localStorage.getItem('roamly_saved_places');
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

function setStoredFavorites(set) {
  try {
    localStorage.setItem('roamly_saved_places', JSON.stringify([...set]));
  } catch (e) {}
}

// ===== Main App =====
export default function App() {
  const [tab, setTab] = useState('Explore');
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [activeRadius, setActiveRadius] = useState(5);
  
  const [userLocation, setUserLocation] = useState(null);
  const [locationToast, setLocationToast] = useState('');
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [compareIds, setCompareIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(getStoredFavorites);
  const [weather, setWeather] = useState(null);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);

  const [dataSource, setDataSource] = useState('live');

  // Initial Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Current Location' }),
        (err) => {
          setUserLocation({ lat: 18.5204, lng: 73.8567, name: 'Pune, Maharashtra' });
          setLocationToast("Couldn't get your location. Check browser permission. Showing Pune.");
          setTimeout(() => setLocationToast(''), 5000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 18.5204, lng: 73.8567, name: 'Pune, Maharashtra' });
      setLocationToast("Couldn't get your location. Check browser permission. Showing Pune.");
      setTimeout(() => setLocationToast(''), 5000);
    }
  }, []);

  // Weather update based on user location
  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng) {
      fetchWeather({ lat: userLocation.lat, lng: userLocation.lng })
        .then(setWeather)
        .catch(() => {});
    }
  }, [userLocation]);

  // Fetch places when filters or location change with TTL cache
  const loadPlaces = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    const params = { lat: userLocation.lat, lng: userLocation.lng, max_distance_km: activeRadius };
    if (search) params.q = search;
    if (category) params.category = category;
    if (maxPrice) params.max_price = Number(maxPrice);
    if (minRating) params.min_rating = Number(minRating);

    const cacheKey = JSON.stringify(params);
    const cached = getCachedPlaces(cacheKey);
    if (cached) {
      setPlaces(cached.places || []);
      setFilteredPlaces(cached.places || []);
      setDataSource(cached.data_source || 'live');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchPlaces(params);
      setPlaces(data.places || []);
      setFilteredPlaces(data.places || []);
      setDataSource(data.data_source || 'live');
      setCachedPlaces(cacheKey, data);
    } catch (e) {
      console.error('Failed to fetch places', e);
      setDataSource('unavailable');
    } finally {
      setLoading(false);
    }
  }, [search, category, maxPrice, minRating, activeRadius, userLocation]);

  useEffect(() => { loadPlaces(); }, [loadPlaces]);

  // Toggle compare checkbox
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle save/favorite with localStorage persistence (Rule C.1)
  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setStoredFavorites(next);
      return next;
    });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Current Location' }),
        (err) => {
          setLocationToast("Couldn't get your location. Check browser permission. Showing Pune.");
          setTimeout(() => setLocationToast(''), 5000);
        }
      );
    } else {
      setLocationToast("Geolocation is not supported by your browser.");
      setTimeout(() => setLocationToast(''), 5000);
    }
  };

  const ctxValue = {
    places, filteredPlaces, setFilteredPlaces, userLocation, setUserLocation,
    selectedPlace, setSelectedPlace, compareIds, toggleCompare, savedIds, toggleSave,
    dataSource, setLocationToast,
  };

  return (
    <AppCtx.Provider value={ctxValue}>
      {/* Toast */}
      {locationToast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#334155', color: '#fff', padding: '10px 20px', borderRadius: 20, zIndex: 1000, fontSize: '0.85rem' }}>
          {locationToast}
        </div>
      )}

      {/* Modular LocationBar Component */}
      <LocationBar
        userLocation={userLocation}
        onOpenModal={() => setIsLocModalOpen(true)}
        onUseMyLocation={handleUseMyLocation}
      />

      {isLocModalOpen && (
        <LocationModal
          onClose={() => setIsLocModalOpen(false)}
          onSelect={setUserLocation}
        />
      )}

      {/* Navbar with brand identity and favorites count badge (Rule C.1) */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => setTab('Explore')}>
          <div className="navbar-brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            Roamly <span className="brand-text-cursive">Travel & City</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="navbar-nav" aria-label="Main Navigation">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              <span>{TAB_ICONS[t]}</span>
              <span>{t}</span>
              {t === 'Compare' && compareIds.size > 0 && ` (${compareIds.size})`}
            </button>
          ))}
        </nav>

        <div className="navbar-right">
          {weather && (
            <div className="weather-widget">
              <span>☁️</span>
              <span>{weather.temperature_c}°C · {weather.condition}</span>
            </div>
          )}

          {/* Favorites Count in Navbar (Rule C.1) */}
          <div
            className="favorites-navbar-pill"
            title={`${savedIds.size} saved places in favorites`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: savedIds.size > 0 ? '#FEE2E2' : '#F8FAFC',
              color: savedIds.size > 0 ? '#E11D48' : '#64748B',
              border: '1px solid',
              borderColor: savedIds.size > 0 ? '#FECDD3' : '#E2E8F0',
              padding: '6px 14px',
              borderRadius: 9999,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'default',
            }}
          >
            <span>{savedIds.size > 0 ? '❤️' : '🤍'}</span>
            <span>Favorites ({savedIds.size})</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {tab === 'Home' && (
          <HomeTab
            weather={weather}
            userLocation={userLocation}
            onNavigateTab={setTab}
          />
        )}
        {tab === 'Explore' && (
          <ExploreTab
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            minRating={minRating} setMinRating={setMinRating}
            activeRadius={activeRadius} setActiveRadius={setActiveRadius}
            loading={loading}
            onExploreClick={() => {
              const el = document.getElementById('popular-places-heading');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
        {tab === 'Map' && <MapView activeTab={tab} />}
        {tab === 'AI Assistant' && <AssistantTab />}
        {tab === 'Compare' && <CompareTab />}
      </main>

      {/* Compare FAB */}
      {compareIds.size >= 2 && tab !== 'Compare' && (
        <button className="compare-fab" onClick={() => setTab('Compare')}>
          ⚖️ Compare ({compareIds.size})
        </button>
      )}

      {/* Place Details Drawer */}
      {selectedPlace && <PlaceDrawer />}

      {/* Modular Footer */}
      <Footer onTabChange={setTab} onCategoryChange={setCategory} />
    </AppCtx.Provider>
  );
}
