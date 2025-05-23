
// Initialize the map
const map = L.map('map').setView([37.8, -96], 4);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


const colorScale = chroma.scale(['#c7a98d', '#e87b15']).domain([0, 21.0]);

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

fetch('data/grasslandsRuralPM10.json')
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
              layer.bindPopup(`<strong>${data.name}</strong><br>PM10 Sequestration: ${data.value} g/m²`);
            } else {
              layer.bindPopup(`<strong>${feature.properties.NAME}</strong><br>Data not available`);
            }
          }
        }).addTo(map);
      });
  });

//Add legend to map
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
const div = L.DomUtil.create('div', 'info legend');
const grades = [0, 5, 10, 15, 21];
const labels = [];

for (let i = 0; i < grades.length - 1; i++) {
    const from = grades[i];
    const to = grades[i + 1];
    const color = colorScale((from + to) / 2).hex();

    labels.push(
    `<i style="background:${color}; width:18px; height:18px; display:inline-block; margin-right:6px;"></i> 
        ${from} &ndash; ${to}`
    );
}

div.innerHTML = `<strong>PM10 Sequestration<br>(g/m²)</strong><br>` + labels.join('<br>');
return div;
};

legend.addTo(map);