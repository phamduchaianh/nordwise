import { datasets } from "./data.js";

let rentChart = null;

// compare chart: key = dataset, order = "low" or "high", count = how many bars
export function renderCompareChart(features, key, order, count) {
    const chartElement = document.getElementById("rent-chart");
    // error handling
    if (!chartElement) {
        console.error("Missing #rent-chart container");
        return;
    }

    const dataset = datasets[key];

    // keep only municipalities with valid data.
    const list = features
        .map((feature) => {
            const props = feature.properties;
            const code = String(props.kunta).padStart(3, "0");

            return {
                code: code,
                name: props.nimi || props.name || code,
                value: dataset.values[code]
            };
        })
        .filter((item) => Number.isFinite(item.value));

    // sort and take the first ones
    list.sort((a, b) => order === "low" ? a.value - b.value : b.value - a.value);
    const shown = list.slice(0, count);

    if (rentChart) {
        rentChart.destroy();
        rentChart = null;
    }
    chartElement.innerHTML = "";

    if (shown.length === 0) {
        chartElement.textContent = "No data available for this dataset.";
        return;
    }

    const chartData = {
        labels: shown.map((item) => item.name),
        datasets: [
            {
                name: dataset.label,
                values: shown.map((item) => item.value)
            }
        ]
    };
    const options = {
        title: `${count} ${order === "low" ? "lowest" : "highest"} - ${dataset.label}`,
        data: chartData,
        type: "bar",
        height: 320,
        colors: ["#6487A5"],
        animate: true,
        valuesOverPoints: true,
        barOptions: {
            spaceRatio: 0.4
        },
        tooltipOptions: {
            formatTooltipY: (value) => `${value.toFixed(2)} ${dataset.unit}`
        }
    };
    rentChart = new frappe.Chart(chartElement, options);
}

// download the compare chart as svg
export function exportCompareChart() {
    if (rentChart) {
        rentChart.export();
    }
}


let rentHistoryChart = null;
let lastHistory = null;
let lastCity = "";
let historyType = "line";   // "line" or "bar"

export function renderRentHistoryChart(history, cityName) {
    lastHistory = history;
    lastCity = cityName;
    drawHistoryChart();
}

// line / bar button
export function setHistoryType(type) {
    historyType = type;
    drawHistoryChart();
}

// draw again (used when the window size changes)
export function redrawHistoryChart() {
    drawHistoryChart();
}

function drawHistoryChart() {
    const container = document.getElementById("rent-history-chart");

    if (!container) {
        console.error("Rent history chart container not found.");
        return;
    }

    // nothing selected yet
    if (!lastHistory) return;

    // Ignore quarters without rent data.
    const validHistory = lastHistory.filter(
        item => item.rent !== null && Number.isFinite(item.rent)
    );

    // clear the previous chart before drawing a new one.
    container.innerHTML = "";
    rentHistoryChart = null;

    if (validHistory.length === 0) {
        container.textContent = "No rent history data available.";
        return;
    }

    const labels = validHistory.map(item => item.quarter);
    const values = validHistory.map(item => item.rent);

    rentHistoryChart = new frappe.Chart("#rent-history-chart", {
        title: `Rent history — ${lastCity}`,
        data: {
            labels,
            datasets: [
                {
                    name: "Average rent",
                    values
                }
            ]
        },
        type: historyType,
        height: 280,
        colors: ["#4F8EF7"],
        axisOptions: {
            xAxisMode: "tick",
            yAxisMode: "span",
            xIsSeries: true
        },
        lineOptions: {
            regionFill: true,
            hideDots: false
        },
        tooltipOptions: {
            formatTooltipY: value => `${value} €/m²`
        }
    });
}

// download the history chart as svg
export function exportHistoryChart() {
    if (rentHistoryChart) {
        rentHistoryChart.export();
    }
}