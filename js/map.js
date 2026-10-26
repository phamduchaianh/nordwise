import { datasets, formatValue, getStats } from "./data.js";

let geoLayer = null;
let legendDiv = null;
let currentKey = "population";
let stats = null;

const colors = ["#deebf7", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];

export function initMap(){
    const map = L.map("map", {
        minZoom: 2
    }).setView([61.9241, 25.7482], 5);  // initial coordiante

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
}

// choose color from the break points
function getColor(value) {
    if (!Number.isFinite(value)) return "#cccccc";

    let i = 0;
    while (i < stats.breaks.length && value >= stats.breaks[i]) {
        i++;
    }
    return colors[i];
}

function styleFeature(feature) {
    const code = String(feature.properties.kunta).padStart(3, "0");
    const value = datasets[currentKey].values[code];

    return {
        fillColor: getColor(value),
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
    };
}

function updateLegend() {
    if (!legendDiv) return;

    const dataset = datasets[currentKey];
    let html = `<strong>${dataset.label}</strong><br>`;

    colors.forEach((color, i) => {
        const from = i === 0 ? stats.min : stats.breaks[i - 1];
        const to = i === colors.length - 1 ? stats.max : stats.breaks[i];

        html += `<i style="background:${color}"></i>${formatValue(from, "")} – ${formatValue(to, "")}<br>`;
    });

    html += `<i style="background:#cccccc"></i>No data`;
    legendDiv.innerHTML = html;
}

// change the layer that is shown on the map
export function setLayer(key) {
    currentKey = key;
    stats = getStats(key);

    if (geoLayer) {
        geoLayer.setStyle(styleFeature);
    }
    updateLegend();
}

//render map function
export function renderMap(map, geoJsonData, onRegionClick, startKey) {
    currentKey = startKey;
    stats = getStats(currentKey);

    geoLayer = L.geoJson(geoJsonData, {
        style: styleFeature,
        onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const cityName = props.nimi || props.name || 'Unknown';
            const kuntaCode = String(props.kunta).padStart(3, "0");

            // tooltip shows the name and the value of the current layer
            layer.bindTooltip(() => {
                const dataset = datasets[currentKey];
                return `${cityName}: ${formatValue(dataset.values[kuntaCode], dataset.unit)}`;
            });

            layer.on({
                mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({
                        weight: 2,
                        color: '#1a365d',
                        fillOpacity: 0.9
                    });
                    l.bringToFront();
                },
                mouseout: (e) => {
                    geoLayer.resetStyle(e.target);
                },
                click: (e) => {
                    if (typeof onRegionClick === 'function') {
                        onRegionClick(props, e.target);
                    }
                    map.fitBounds(e.target.getBounds());
                }
            });
        }
    }).addTo(map);

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
        legendDiv = L.DomUtil.create("div", "legend");
        return legendDiv;
    };
    legend.addTo(map);
    updateLegend();

    return geoLayer;
}