// js/app.js
import { fetchGeoJson } from "./api.js";
import { initMap, renderMap } from "./map.js";

const map = initMap("map");
console.log("Fetching map api...");
const geoJsonData = await fetchGeoJson();

const handleRegionClick = (props, layer) => {
    const infoPanel = document.getElementById('info-panel');
    const cityName = props.nimi || props.name || 'Unknown';
    const svName = props.namn || 'N/A';
    const kuntaCode = props.kunta;

    console.log(`Clicked on municipality: ${cityName} (Code: ${kuntaCode})`);

    // info placeholder
    infoPanel.innerHTML = `
        <h3 style="margin-bottom: 8px; color: #1a365d;">${cityName} (${svName})</h3>
        <p><strong>Municipality Code:</strong> ${kuntaCode}</p>
        <p><strong>Region ID:</strong> ${props.maakunta || 'N/A'}</p>
        <hr style="margin: 12px 0; border: 0; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 0.9rem;">Sẵn sàng nạp dữ liệu thống kê, giá nhà, thu nhập vào đây ngày mai!</p>
    `;
};

console.log("Rendering map...");
renderMap(map, geoJsonData, handleRegionClick);