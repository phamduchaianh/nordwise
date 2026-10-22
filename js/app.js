// js/app.js
import { fetchGeoJson, fetchPopulation, fetchRent } from "./api.js";
import { initMap, renderMap } from "./map.js";

const map = initMap("map");

console.log("Fetching all APIs...");
const [geoJsonData, rentObj, popObj] = await Promise.all([
    fetchGeoJson(),
    fetchRent(),
    fetchPopulation()
]);

// data binds
geoJsonData.features.forEach(feature => {
    const kuntaCode = feature.properties.kunta;
    feature.properties.rent = rentObj[kuntaCode] ? `${rentObj[kuntaCode]} €/m²` : 'N/A';
    feature.properties.population = popObj[kuntaCode] ? popObj[kuntaCode].toLocaleString('fi-FI') : 'N/A';
});

// sidebar
const handleRegionClick = (props, layer) => {
    const infoPanel = document.getElementById('info-panel');
    const cityName = props.nimi || props.name || 'Unknown';
    infoPanel.innerHTML = `
        <h3>${cityName}</h3>
        <p><strong>Kunta code:</strong> ${props.kunta}</p>
        <p><strong>Population:</strong> ${props.population} people</p>
        <p><strong>Average Rent Price:</strong> ${props.rent}</p>
    `;
};

console.log("Rendering map...");
renderMap(map, geoJsonData, handleRegionClick);
