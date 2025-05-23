
// Initialize the map
const map = L.map('map').setView([37.8, -96], 4);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


const colorScale = chroma.scale(['#d6d6ff', '#1d49a8']).domain([0, 0.17]);

function getColor(d) {
  if (d === null || d === undefined) return '#f2f2f2';  // no data color
  return colorScale(d).hex();
}


function style(feature) {
  const fips = feature.properties.GEOID;
  const data = countyData[fips];
  const value = data ? data.value : null;
  return {
    fillColor: getColor(value),  
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

// Load county data
let countyData = {};

fetch('data/grasslandsRuralNO2.json')
  .then(response => response.json())
  .then(data => {
    countyData = data;
    
    fetch('data/counties.geojson')
      .then(response => response.json())
      .then(geojsonData => {
        L.geoJson(geojsonData, {
          style: style,
          onEachFeature: function (feature, layer) {
            const fips = feature.properties.GEOID;
            const data = countyData[fips];
            if (data) {
              layer.bindPopup(`<strong>${data.name}</strong><br>NO₂ Sequestration: ${data.value} g/m²`);
            } else {
              layer.bindPopup(`<strong>${feature.properties.NAME}</strong><br>Data not available`);
            }
          }
        }).addTo(map);
      });
  });
