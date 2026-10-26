// js/app.js
import { fetchEmployment, fetchGeoJson, fetchPopulation, fetchRent, fetchRentHistory } from "./api.js";
import {
    exportCompareChart,
    exportHistoryChart,
    redrawHistoryChart,
    renderCompareChart,
    renderRentHistoryChart,
    setHistoryType
} from "./charts.js";
import { addCustomDataset, datasets, formatValue, setValues } from "./data.js";
import { initMap, renderMap, setLayer } from "./map.js";

const map = initMap("map");

console.log("Fetching all APIs...");
const [geoJsonData, rentObj, popObj, empObj] = await Promise.all([
    fetchGeoJson(),
    fetchRent(),
    fetchPopulation(),
    fetchEmployment()
]);

// save the data to datasets
setValues("rent", rentObj);
setValues("population", popObj);
setValues("employment", empObj);

// what is selected now
let currentLayer = "population";
let compareKey = "rent";
let compareOrder = "low";
let compareCount = 10;

// html elements
const tray = document.getElementById("data-tray");
const layerSelect = document.getElementById("layer-select");
const compareSelect = document.getElementById("compare-select");
const orderSelect = document.getElementById("order-select");
const countSelect = document.getElementById("count-select");
const aSelect = document.getElementById("a-select");
const bSelect = document.getElementById("b-select");
const opSelect = document.getElementById("op-select");

// ===== change map layer / chart data =====
function changeLayer(key) {
    currentLayer = key;
    layerSelect.value = key;
    setLayer(key);
}

function drawCompare() {
    renderCompareChart(geoJsonData.features, compareKey, compareOrder, compareCount);
}

function changeCompare(key) {
    compareKey = key;
    compareSelect.value = key;
    drawCompare();
}

// ===== lists and chips =====
function fillSelect(select) {
    const oldValue = select.value;
    select.innerHTML = "";

    Object.keys(datasets).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = datasets[key].label;
        select.appendChild(option);
    });

    if (datasets[oldValue]) {
        select.value = oldValue;
    }
}

function makeChips() {
    tray.innerHTML = "";

    Object.keys(datasets).forEach((key) => {
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = datasets[key].label;
        chip.draggable = true;

        // drag: save the key
        chip.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", key);
        });

        // click (for phone): change both map and chart
        chip.addEventListener("click", () => {
            changeLayer(key);
            changeCompare(key);
        });

        tray.appendChild(chip);
    });
}

function refreshLists() {
    fillSelect(layerSelect);
    fillSelect(compareSelect);
    fillSelect(aSelect);
    fillSelect(bSelect);
    makeChips();
}

refreshLists();
layerSelect.value = currentLayer;
compareSelect.value = compareKey;
aSelect.value = "rent";
bSelect.value = "population";

// ===== drag and drop =====
function makeDropZone(element, onDrop) {
    element.addEventListener("dragover", (e) => {
        e.preventDefault();
        element.classList.add("drag-over");
    });

    element.addEventListener("dragleave", () => {
        element.classList.remove("drag-over");
    });

    element.addEventListener("drop", (e) => {
        e.preventDefault();
        element.classList.remove("drag-over");

        const key = e.dataTransfer.getData("text/plain");
        if (datasets[key]) {
            onDrop(key);
        }
    });
}

makeDropZone(document.querySelector(".map-panel"), changeLayer);
makeDropZone(document.getElementById("compare-panel"), changeCompare);

// ===== buttons and dropdowns =====
layerSelect.addEventListener("change", () => changeLayer(layerSelect.value));
compareSelect.addEventListener("change", () => changeCompare(compareSelect.value));

orderSelect.addEventListener("change", () => {
    compareOrder = orderSelect.value;
    drawCompare();
});

countSelect.addEventListener("change", () => {
    compareCount = Number(countSelect.value);
    drawCompare();
});

document.getElementById("reset-btn").addEventListener("click", () => {
    map.setView([61.9241, 25.7482], 5);
});

document.getElementById("line-btn").addEventListener("click", () => setHistoryType("line"));
document.getElementById("bar-btn").addEventListener("click", () => setHistoryType("bar"));

document.getElementById("download-compare").addEventListener("click", exportCompareChart);
document.getElementById("download-history").addEventListener("click", exportHistoryChart);

// make new data from two datasets
document.getElementById("apply-btn").addEventListener("click", () => {
    const newKey = addCustomDataset(aSelect.value, bSelect.value, opSelect.value);

    refreshLists();
    changeLayer(newKey);
    changeCompare(newKey);
});

// draw the charts again when the window size changes
let resizeTimer = null;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        drawCompare();
        redrawHistoryChart();
    }, 300);
});

// sidebar

const handleRegionClick = async (props, layer) => {
    const infoPanel = document.getElementById("info-panel");
    const cityName = props.nimi || props.name || "Unknown";
    const code = props.kunta;
    const paddedCode = String(code).padStart(3, "0");

    //sidebar content.
    let html = `
        <h3>${cityName}</h3>
        <p><strong>Kunta code:</strong> ${code}</p>
    `;
    // show every dataset (also the ones the user made)
    Object.keys(datasets).forEach((key) => {
        const dataset = datasets[key];
        html += `<p><strong>${dataset.label}:</strong> ${formatValue(dataset.values[paddedCode], dataset.unit)}</p>`;
    });
    infoPanel.innerHTML = html;

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

renderMap(map, geoJsonData, handleRegionClick, currentLayer);

// first draw of the compare chart
drawCompare();