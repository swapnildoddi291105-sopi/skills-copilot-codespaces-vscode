import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from './App.jsx';

const DEFAULT_CENTER = [18.5204, 73.8567]; // Pune
const ZOOM = 13;

// Category → color mapping for Roamly
const CAT_COLORS = {
  historical: '#D97706',
  attraction: '#7C3AED',
  restaurant: '#DC2626',
  cafe: '#059669',
  hotel: '#DB2777',
};

const pulseIcon = L.divIcon({
  className: 'user-marker',
  html: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to fly map to user location and handle resize
function MapController({ pos, activeTab }) {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate size on tab switch to prevent gray tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [activeTab, map]);

  useEffect(() => {
    if (pos && pos.lat && pos.lng) {
      map.flyTo([pos.lat, pos.lng], 14, { duration: 1.2 });
    }
  }, [pos, map]);
  return null;
}

export default function MapView({ activeTab }) {
  const { filteredPlaces, userLocation, setUserLocation, setSelectedPlace, setLocationToast } = useApp();
  const mapRef = useRef(null);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      if (setLocationToast) setLocationToast("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Current Location' }),
      (err) => {
        if (setLocationToast) {
          setLocationToast("Couldn't get your location. Check browser permission. Showing Pune.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const center = userLocation && userLocation.lat && userLocation.lng 
    ? [userLocation.lat, userLocation.lng] 
    : DEFAULT_CENTER;

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={ZOOM}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController pos={userLocation} activeTab={activeTab} />

        {/* User location pulsing marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={pulseIcon}>
            <Popup>
              <div className="popup-name">📍 {userLocation.name || 'Your Location'}</div>
            </Popup>
          </Marker>
        )}

        {/* Place markers */}
        {filteredPlaces.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={8}
            pathOptions={{
              color: CAT_COLORS[p.category] || '#F97316',
              fillColor: CAT_COLORS[p.category] || '#F97316',
              fillOpacity: 0.8,
              weight: 2,
            }}
            eventHandlers={{
              click: () => setSelectedPlace(p),
            }}
          >
            <Popup>
              <div className="popup-name">{p.name}</div>
              <div className="popup-price">
                {p.price_inr != null ? `₹${p.price_inr}` : 'Price not available'}
              </div>
              <a
                className="popup-link"
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🧭 Get Directions
              </a>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="map-controls">
        <button className="btn btn-secondary" onClick={handleLocate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> Use my location
        </button>
      </div>
    </div>
  );
}
