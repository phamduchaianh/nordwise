let rentChart = null;

export function renderRentChart(features) {
    const chartElement = document.getElementById("rent-chart");
    // error handling
    if (!chartElement) {
        console.error("Missing #rent-chart container");
        return;
    }
    // keep only municipalities with valid rent data.
    const rentData = features
        .map((feature) => {
            const props = feature.properties;

            return {
                code: props.kunta,
                name: props.nimi || props.name || props.kunta,
                rent: props.rentValue
            };
        })
        .filter((item) =>
            /^\d{3}$/.test(String(item.code)) &&
            Number.isFinite(item.rent)
        );

    // show the 10 municipalities with the lowest rent.
    rentData.sort((a, b) => a.rent - b.rent);
    const topTen = rentData.slice(0, 10);

    if (topTen.length === 0) {
        chartElement.textContent =
            "No municipality-level rent data available.";
        return;
    }

    const chartData = {
        labels: topTen.map((item) => item.name),
        datasets: [
            {
                name: "Average rent (€/m²)",
                values: topTen.map((item) => item.rent)
            }
        ]
    };
    const options = {
        title: "10 Lowest-Rent Municipalities",
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
            formatTooltipY: (value) => `${value.toFixed(2)} €/m²`
        }
    };
    if (rentChart) {
        rentChart.destroy();
    }
    chartElement.innerHTML = "";
    rentChart = new frappe.Chart(chartElement, options);
}


let rentHistoryChart = null;

export function renderRentHistoryChart(history, cityName) {
    const container = document.getElementById("rent-history-chart");

    if (!container) {
        console.error("Rent history chart container not found.");
        return;
    }

    // Ignore quarters without rent data.
    const validHistory = history.filter(
        item => item.rent !== null && Number.isFinite(item.rent)
    );

    // Clear the previous chart before drawing a new one.
    container.innerHTML = "";
    rentHistoryChart = null;

    if (validHistory.length === 0) {
        container.textContent = "No rent history data available.";
        return;
    }

    const labels = validHistory.map(item => item.quarter);
    const values = validHistory.map(item => item.rent);

    rentHistoryChart = new frappe.Chart("#rent-history-chart", {
        title: `Rent history — ${cityName}`,
        data: {
            labels,
            datasets: [
                {
                    name: "Average rent",
                    values
                }
            ]
        },
        type: "line",
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
