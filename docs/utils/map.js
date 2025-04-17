import L from 'leaflet';

let selectedLocation = null;

export function initMap() {
  const map = L.map('map').setView([-6.597147, 106.806038], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker = null;

  map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    if (marker) {
      map.removeLayer(marker);
    }

    marker = L.marker([lat, lng]).addTo(map)
      .bindPopup(`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`)
      .openPopup();

    selectedLocation = { lat, lng };

    document.getElementById('latInput').value = lat.toFixed(5);
    document.getElementById('lngInput').value = lng.toFixed(5);
  });
}

export function getSelectedLocation() {
  return selectedLocation;
}
