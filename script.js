// Global variables
let map;
let currentRoute = null;
let trafficMap = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initMap();
  initTrafficMap();
  setupEventListeners();
});

// Initialize main map
function initMap() {
  map = L.map('map').setView([40.7128, -74.0060], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Add traffic overlay (simulated)
  addTrafficOverlay(map);
}

// Initialize traffic analysis map
function initTrafficMap() {
  if (document.getElementById('traffic-map')) {
    trafficMap = L.map('traffic-map').setView([40.7128, -74.0060], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(trafficMap);
    
    // Add traffic visualization
    const trafficPoints = [
      { lat: 40.7128, lng: -74.0060, intensity: 'high' },
      { lat: 40.7200, lng: -74.0100, intensity: 'medium' },
      { lat: 40.7150, lng: -73.9950, intensity: 'low' },
      { lat: 40.7050, lng: -74.0150, intensity: 'medium' },
      { lat: 40.7300, lng: -74.0200, intensity: 'high' }
    ];
    
    trafficPoints.forEach(point => {
      const color = point.intensity === 'high' ? '#dc3545' : 
                   point.intensity === 'medium' ? '#ffc107' : '#28a745';
      
      L.circle([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 300
      }).addTo(trafficMap);
    });
  }
}

// Add traffic overlay to map
function addTrafficOverlay(targetMap) {
  const trafficData = [
    { lat: 40.7128, lng: -74.0060, intensity: 'high' },
    { lat: 40.7200, lng: -74.0100, intensity: 'medium' },
    { lat: 40.7150, lng: -73.9950, intensity: 'low' },
    { lat: 40.7050, lng: -74.0150, intensity: 'medium' },
    { lat: 40.7300, lng: -74.0200, intensity: 'high' }
  ];
  
  trafficData.forEach(point => {
    const color = point.intensity === 'high' ? '#dc3545' : 
                 point.intensity === 'medium' ? '#ffc107' : '#28a745';
    
    L.circle([point.lat, point.lng], {
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: 300
    }).addTo(targetMap);
  });
}

// Set up event listeners
function setupEventListeners() {
  // Page navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      const page = this.getAttribute('onclick').match(/'([^']+)'/)[1];
      showPage(page);
    });
  });
  
  // Find route button
  const findRouteBtn = document.getElementById('find-route-btn');
  if (findRouteBtn) {
    findRouteBtn.addEventListener('click', findRoutes);
  }
  
  // Route options
  document.querySelectorAll('.route-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.route-option').forEach(opt => {
        opt.classList.remove('active');
      });
      this.classList.add('active');
      updateSelectedRoute(this);
    });
  });
  
  // Travel mode selection
  document.querySelectorAll('.travel-mode').forEach(mode => {
    mode.addEventListener('click', function() {
      document.querySelectorAll('.travel-mode').forEach(m => {
        m.classList.remove('active');
      });
      this.classList.add('active');
      updateTravelMode(this.getAttribute('data-mode'));
    });
  });
  
  // Rating stars
  document.querySelectorAll('.rating-star').forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      setRating(rating);
    });
  });
}

// Show selected page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });
  
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = 'block';
  }
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick').includes(pageId)) {
      link.classList.add('active');
    }
  });
  
  if (pageId === 'traffic' && trafficMap) {
    setTimeout(() => {
      trafficMap.invalidateSize();
    }, 100);
  }
}

// Find routes based on inputs
function findRoutes() {
  const startLocation = document.getElementById('start-location').value;
  const destination = document.getElementById('destination').value;
  
  if (!startLocation || !destination) {
    alert('Please enter both starting point and destination');
    return;
  }
  
  if (currentRoute) {
    map.removeLayer(currentRoute);
  }
  
  // Simulate coordinates
  const startCoords = [40.7128 + Math.random() * 0.01, -74.0060 + Math.random() * 0.01];
  const destCoords = [40.7128 + Math.random() * 0.02, -74.0060 + Math.random() * 0.02];
  
  // Add markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  
  L.marker(startCoords)
    .addTo(map)
    .bindPopup('Start: ' + startLocation);
    
  L.marker(destCoords)
    .addTo(map)
    .bindPopup('Destination: ' + destination);
  
  // Create route
  const routePoints = [
    startCoords,
    [startCoords[0] + (destCoords[0] - startCoords[0]) * 0.25, startCoords[1] + (destCoords[1] - startCoords[1]) * 0.25],
    [startCoords[0] + (destCoords[0] - startCoords[0]) * 0.5, startCoords[1] + (destCoords[1] - startCoords[1]) * 0.5],
    [startCoords[0] + (destCoords[0] - startCoords[0]) * 0.75, startCoords[1] + (destCoords[1] - startCoords[1]) * 0.75],
    destCoords
  ];
  
  currentRoute = L.polyline(routePoints, {color: '#0d6efd', weight: 5}).addTo(map);
  map.fitBounds(currentRoute.getBounds(), {padding: [50, 50]});
  
  // Show feedback modal after delay
  setTimeout(() => {
    const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    feedbackModal.show();
  }, 10000);
}

// Update selected route
function updateSelectedRoute(selectedOption) {
  if (currentRoute) {
    map.removeLayer(currentRoute);
  }
  
  const options = Array.from(document.querySelectorAll('.route-option'));
  const index = options.indexOf(selectedOption);
  
  // Generate route points
  const startCoords = [40.7128, -74.0060];
  const destCoords = [40.7228, -73.9860];
  
  const routePoints = [
    startCoords,
    [startCoords[0] + (destCoords[0] - startCoords[0]) * 0.25 + (index - 1) * 0.005, 
     startCoords[1] + (destCoords[1] - startCoords[1]) * 0.25 + (index - 1) * 0.005],
    [startCoords[0] + (destCoords[0] - startCoords[0]) * 0.5 + (index - 1) * 0.005, 
     startCoords[1] + (destCoords[1] - startCoords[1]) * 0.5 + (index - 1) * 0.005],
    [startCoords[0] + (destCoords[0] - startCoords[0]) * 0.75 + (index - 1) * 0.005, 
     startCoords[1] + (destCoords[1] - startCoords[1]) * 0.75 + (index - 1) * 0.005],
    destCoords
  ];
  
  const colors = ['#0d6efd', '#20c997', '#6c757d'];
  
  currentRoute = L.polyline(routePoints, {
    color: colors[index] || colors[0],
    weight: 5
  }).addTo(map);
  
  map.fitBounds(currentRoute.getBounds(), {padding: [50, 50]});
}

// Update travel mode
function updateTravelMode(mode) {
  const modeIcons = {
    'driving': 'bi-car-front',
    'transit': 'bi-bus-front',
    'walking': 'bi-person-walking',
    'cycling': 'bi-bicycle',
    'rideshare': 'bi-people'
  };
  
  const modeTimes = {
    'driving': ['25 min', '32 min', '40 min'],
    'transit': ['35 min', '42 min', '50 min'],
    'walking': ['2 hr 30 min', '3 hr', '2 hr 15 min'],
    'cycling': ['50 min', '1 hr 5 min', '45 min'],
    'rideshare': ['28 min', '35 min', '42 min']
  };
  
  document.querySelectorAll('.route-option').forEach((option, index) => {
    const timeElement = option.querySelector('.bi-clock').parentNode;
    const timeText = modeTimes[mode][index];
    const distanceText = timeElement.querySelector('small').textContent;
    
    timeElement.innerHTML = `<i class="bi ${modeIcons[mode]}"></i> ${timeText} <small class="text-muted ms-2">${distanceText}</small>`;
  });
}

// Set rating
function setRating(rating) {
  document.querySelectorAll('.rating-star').forEach(star => {
    const starRating = parseInt(star.getAttribute('data-rating'));
    if (starRating <= rating) {
      star.classList.remove('bi-star');
      star.classList.add('bi-star-fill');
    } else {
      star.classList.remove('bi-star-fill');
      star.classList.add('bi-star');
    }
  });
}