// save spot for data
export const datasets = {
    population: { label: "Population", unit: "people", values: {} },
    rent: { label: "Average rent", unit: "€/m²", values: {} },
    employment: { label: "Employment rate", unit: "%", values: {} }
};

let customCount = 0;

export function setValues(key, values) {
    datasets[key].values = values;
}

// make a number look nice, for example 1 234 567
export function formatValue(value, unit) {
    if (!Number.isFinite(value)) return "N/A";
    const text = value.toLocaleString("fi-FI", { maximumFractionDigits: 2 });
    return `${text} ${unit}`.trim();
}

// combine two datasets with + - * /
export function addCustomDataset(aKey, bKey, op) {
    const a = datasets[aKey];
    const b = datasets[bKey];
    const result = {};

    Object.keys(a.values).forEach((code) => {
        const x = a.values[code];
        const y = b.values[code];

        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        let answer = null;
        if (op === "+") answer = x + y;
        if (op === "-") answer = x - y;
        if (op === "*") answer = x * y;
        if (op === "/") answer = y !== 0 ? x / y : null;

        if (answer !== null) {
            result[code] = Math.round(answer * 100) / 100;
        }
    });

    customCount++;
    const key = "custom" + customCount;
    const opText = op === "*" ? "×" : op === "/" ? "÷" : op === "-" ? "−" : "+";

    datasets[key] = {
        label: `${a.label} ${opText} ${b.label}`,
        unit: "",
        values: result
    };
    return key;
}

// min, max and 4 break points (5 groups with the same amount of municipalities)
export function getStats(key) {
    const list = Object.values(datasets[key].values).filter(Number.isFinite);

    if (list.length === 0) {
        return { min: 0, max: 0, breaks: [0, 0, 0, 0] };
    }

    list.sort((a, b) => a - b);

    const breaks = [1, 2, 3, 4].map((i) => list[Math.floor(list.length * i / 5)]);

    return { min: list[0], max: list[list.length - 1], breaks: breaks };
}