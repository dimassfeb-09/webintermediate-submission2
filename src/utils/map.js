import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_SERVICE_API_KEY } from "./config";

let selectedLocation = null;

export function initMap() {
  const map = L.map("map").setView([-6.2088, 106.8456], 13);

  L.tileLayer(
    `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAP_SERVICE_API_KEY}`,
    {
      attribution: "© OpenStreetMap contributors © MapTiler",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(map);

  let marker = null;

  map.on("click", function (e) {
    const { lat, lng } = e.latlng;

    if (marker) {
      map.removeLayer(marker);
    }

    marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`)
      .openPopup();

    selectedLocation = { lat, lng };

    document.getElementById("latInput").value = lat.toFixed(5);
    document.getElementById("lngInput").value = lng.toFixed(5);
  });
}

export function getSelectedLocation() {
  return selectedLocation;
}
