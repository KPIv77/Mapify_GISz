// Create the map and set default view (Leaflet).
// Set Bangkok as default center(13.736717, 100.523186) with zoom level 6.
const map = L.map("map").setView([13.736717, 100.523186], 6);

// Add OpenStreetMap tiles with attribution.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
