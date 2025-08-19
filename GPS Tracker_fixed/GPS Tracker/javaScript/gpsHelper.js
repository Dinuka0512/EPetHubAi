// Firebase Setup DO NOT CHANGE
const firebaseConfig = {
  apiKey: "AIzaSyBoavfgTNXAaZzQYcchtafWuW_lE2erVRk",
  authDomain: "gpstracker-96510.firebaseapp.com",
  databaseURL: "https://gpstracker-96510-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gpstracker-96510",
  storageBucket: "gpstracker-96510.appspot.com",
  messagingSenderId: "70413476738",
  appId: "1:70413476738:web:85ce96d3b7905523f7a59b",
  measurementId: "G-V0BBJWMFZ3"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let map;
let polyline = null;
let markers = [];

// Initialize Google Map
function gpsInitMap(containerId = "map", defaultLocation = { lat: 6.9271, lng: 79.8612 }, zoom = 13) {
  map = new google.maps.Map(document.getElementById(containerId), {
    center: defaultLocation,
    zoom: zoom,
  });
}

// Load latest events
function loadLatestEvents(limit = 5, callback) {
  const recentEvents = db.ref('event/').limitToLast(limit);
  recentEvents.on('value', snapshot => {
    const events = snapshot.val();
    if (!events) return;

    const timestamps = Object.keys(events);
    const latestTimestamp = timestamps[timestamps.length - 1];
    const latest = {
      ...events[latestTimestamp],   // all fields from the event
      timestamp: latestTimestamp    // add the key as a field
    };


    if (latest.location?.lat && latest.location?.lng && map) {
      drawPath(latest.location.lat, latest.location.lng, events);
    }

    if (callback) callback({ latest, events, latestTimestamp });
  });
}

// Draw polyline and markers on map
function drawPath(lat, lng, events) {
  if (!map) return;

  const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
  map.setCenter(location);

  // Clear previous polyline and markers
  if (polyline) polyline.setMap(null);
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const pathCoordinates = Object.values(events)
      .filter(e => e.location?.lat && e.location?.lng)
      .map(e => ({
        lat: parseFloat(e.location.lat),
        lng: parseFloat(e.location.lng)
      }));

  polyline = new google.maps.Polyline({
    path: pathCoordinates,
    geodesic: true,
    strokeColor: "#f59e0b",
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map: map
  });

  pathCoordinates.forEach((coord, index) => {
    const marker = new google.maps.Marker({
      position: coord,
      map: map,
      title: `Point ${index + 1}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#f59e0b",
        fillOpacity: 0.9,
        strokeWeight: 1,
        strokeColor: "#ffffff"
      }
    });
    markers.push(marker);

    if (index === pathCoordinates.length - 1) {
      const infoWindow = new google.maps.InfoWindow({ content: "<b>🐾 I'm here</b>" });
      infoWindow.open(map, marker);
    }
  });
}

// Expose functions
window.gpsInitMap = gpsInitMap;
window.loadLatestEvents = loadLatestEvents;
window.drawPath = drawPath;
