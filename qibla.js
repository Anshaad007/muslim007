// Qibla Finder Logic
// Kaaba coordinates
const MAKKAH_LAT = 21.4225;
const MAKKAH_LON = 39.8262;

function toRadians(deg) { return deg * Math.PI / 180; }
function toDegrees(rad) { return rad * 180 / Math.PI; }

function calculateQibla(lat, lon) {
  // Great-circle formula
  const dLon = toRadians(MAKKAH_LON - lon);
  const lat1 = toRadians(lat);
  const lat2 = toRadians(MAKKAH_LAT);
  const y = Math.sin(dLon);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
  let angle = Math.atan2(y, x);
  angle = toDegrees(angle);
  return (angle + 360) % 360;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 6371; // km
  const dLat = toRadians(lat2-lat1);
  const dLon = toRadians(lon2-lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function updateCompass(angle) {
  const arrow = document.getElementById('compass-arrow');
  arrow.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
}

function showQiblaInfo(angle, distance) {
  document.getElementById('qibla-angle').textContent = `Qibla Angle: ${angle.toFixed(1)}° from North`;
  document.getElementById('qibla-distance').textContent = `Distance to Makkah: ${distance.toFixed(1)} km`;
}

function showLocationStatus(msg) {
  document.getElementById('location-status').textContent = msg;
}

function handleLocation(lat, lon, city) {
  const angle = calculateQibla(lat, lon);
  const distance = calculateDistance(lat, lon, MAKKAH_LAT, MAKKAH_LON);
  updateCompass(angle);
  showQiblaInfo(angle, distance);
  showLocationStatus(`Your Location: ${city ? city+',' : ''} (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
}

function getCityName(lat, lon, cb) {
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    .then(r => r.json())
    .then(data => cb(data.address.city || data.address.town || data.address.village || data.address.state || ''))
    .catch(() => cb(''));
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showLocationStatus('Geolocation not supported. Please enter your city below.');
    document.getElementById('manual-location').style.display = '';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      getCityName(lat, lon, city => handleLocation(lat, lon, city));
    },
    err => {
      showLocationStatus('Location access denied. Please enter your city below.');
      document.getElementById('manual-location').style.display = '';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

document.getElementById('find-qibla-btn').addEventListener('click', () => {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return alert('Please enter a city.');
  fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`)
    .then(r => r.json())
    .then(data => {
      if (data.length === 0) return alert('City not found.');
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      handleLocation(lat, lon, city);
    })
    .catch(() => alert('Error fetching city location.'));
});

// Try to get location on load
window.onload = getUserLocation;
