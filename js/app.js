// js/app.js
import { fetchGeoJson, fetchPopulation, fetchRent, fetchRentHistory } from "./api.js";
import { renderRentChart, renderRentHistoryChart } from "./charts.js";
import { initMap, renderMap } from "./map.js";

const map = initMap("map");

console.log("Fetching all APIs...");
const [geoJsonData, rentObj, popObj] = await Promise.all([
    fetchGeoJson(),
    fetchRent(),
    fetchPopulation()
]);

// data binds
geoJsonData.features.forEach((feature) => {
    const kuntaCode = String(feature.properties.kunta)
        .padStart(3, "0");

    const rentValue = rentObj[kuntaCode];
    const populationValue = popObj[kuntaCode];

    feature.properties.rentValue =
        Number.isFinite(rentValue) ? rentValue : null;

    feature.properties.rent =
        feature.properties.rentValue !== null
            ? `${feature.properties.rentValue} €/m²`
            : "N/A";

    feature.properties.population =
        populationValue !== null &&
        populationValue !== undefined
            ? Number(populationValue).toLocaleString("fi-FI")
            : "N/A";
});

// Render the chart using the same data as the map.
renderRentChart(geoJsonData.features);

// sidebar

const handleRegionClick = async (props, layer) => {
    const infoPanel = document.getElementById("info-panel");
    const cityName = props.nimi || props.name || "Unknown";
    const code = props.kunta;

    //sidebar content.
    infoPanel.innerHTML = `
        <h3>${cityName}</h3>
        <p><strong>Kunta code:</strong> ${code}</p>
        <p><strong>Population:</strong> ${props.population} people</p>
        <p><strong>Average Rent Price:</strong> ${props.rent}</p>
    `;

    // fetch and render rent history for the selected municipality.
    const chartContainer = document.getElementById("rent-history-chart");
    chartContainer.textContent = "Loading rent history...";

    try {
        const history = await fetchRentHistory(code);
        renderRentHistoryChart(history, cityName);
    } catch (error) {
        console.error("Could not load rent history:", error);
        chartContainer.textContent = "Failed to load rent history.";
    }
};

renderMap(map, geoJsonData, handleRegionClick);
