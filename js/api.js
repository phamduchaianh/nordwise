const GEO_JSON_API = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet%3Akunta4500k&outputFormat=application%2Fjson&srsName=EPSG%3A4326";

const POPULATION_API = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/vaerak/11ra.px";

const RENT_API = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/asvu/15fa.px";

const EMPLOYMENT_API = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/tyokay/115x.px";

//===============GEO JSON DATA FOR MAP=================
export async function fetchGeoJson() {
    try {
        const response = await fetch(GEO_JSON_API);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);    //error handling (fixed: backticks)
        return await response.json();   //return feature collection
    } catch(error){
        console.error("Geo Json API failed:", error);
        throw error;
    }
}

//===============POPULATION=====================
export async function fetchPopulation() {
    const queryPayload = {
        "query": [
            {
                "code": "alue_23_20260101",
                "selection": {
                    "filter": "all",
                    "values": ["*"]
                }
            },
            {
                "code": "contentscode",
                "selection": {
                    "filter": "item",
                    "values": ["vaerak-vaesto"] // population 31 Dec
                }
            },
            {
                "code": "timeperiod_y",
                "selection": {
                    "filter": "item",
                    "values": ["2025"] // year
                }
            }
        ],
        "response": {
            "format": "json-stat2"
        }
    };
    try {
        const response = await fetch(POPULATION_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryPayload)
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Population API Error ${response.status}: ${errText}`);
        }
        const pxData = await response.json();
        // object convert
        const areaCodes = pxData.dimension.alue_23_20260101.category.index;
        const values = pxData.value;
        const popObj = {};
        // convert KU code
        Object.entries(areaCodes).forEach(([codeWithKU, index]) => {
            const kuntaCode = codeWithKU.replace('KU', '').padStart(3, '0');
            popObj[kuntaCode] = values[index] !== null ? values[index] : null;
        });
        console.log("Population API loaded successfully!", popObj);
        return popObj;
    } catch (error) {
        console.error("Failed to fetch population data:", error);
        return {};
    }
}
//======================CURRENT RENT DATA=======================
export async function fetchRent() {
    const queryPayload = {
        "query": [
            {
                "code": "alue_44_20260101",
                "selection": { "filter": "all", "values": ["*"] }
            },
            {
                "code": "rahoitus_2_20260101",
                "selection": { "filter": "item", "values": ["SSS"] }
            },
            {
                "code": "huoneluku_5_20260101",
                "selection": { "filter": "item", "values": ["SSS"] }
            },
            {
                "code": "timeperiod_q",
                "selection": { "filter": "item", "values": ["2026Q3"] }
            },
            {
                "code": "contentscode",
                "selection": { "filter": "item", "values": ["asvu_keskineliovuokra"] }
            }
        ],
        "response": { "format": "json-stat2" }
    };
    try {
        const response = await fetch(RENT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryPayload)
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Rent API Error ${response.status}: ${errText}`);
        }
        const pxData = await response.json();
        const areaCodes = pxData.dimension.alue_44_20260101.category.index;
        const values = pxData.value;
        const rentObj = {};
        Object.entries(areaCodes).forEach(([rawCode, index]) => {
            const rentVal = values[index];
            // only use direct municipality codes.
            // do not treat sub-area values as municipality averages.
            if (!/^\d{3}$/.test(rawCode)) return;

            if (rentVal === null || rentVal === undefined) return;

            rentObj[rawCode] = Number(rentVal);
        });
        console.log("Parsed Rent Data Object:", rentObj);
        return rentObj;
    } catch (error) {
        console.error("Failed to fetch rent data:", error);
        return {};
    }
}

//======================EMPLOYMENT RATE (NEW)=======================
export async function fetchEmployment() {
    const queryPayload = {
        query: [
            {
                code: "alue_23_20250101",
                selection: {
                    filter: "all",
                    values: ["*"]
                }
            },
            {
                code: "timeperiod_y",
                selection: {
                    filter: "item",
                    values: ["2024"]
                }
            },
            {
                code: "contentscode",
                selection: {
                    filter: "item",
                    values: ["tyokay-tyollisyysaste"]
                }
            }
        ],
        response: {
            format: "json-stat2"
        }
    };
    try {
        const response = await fetch(EMPLOYMENT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(queryPayload)
        });

        if (!response.ok) {
            throw new Error(
                `Employment API error: ${response.status} - ${await response.text()}`
            );
        }

        const pxData = await response.json();
        const areaCodes = pxData.dimension["alue_23_20250101"].category.index;
        const empObj = {};

        Object.entries(areaCodes).forEach(([rawCode, index]) => {
            const code = rawCode.replace(/^KU/, "");

            if (!/^\d{3}$/.test(code)) return;

            const value = pxData.value[index];

            if (value === null || value === undefined) return;

            empObj[code] = Number(value);
        });

        console.log("Employment rate data:", empObj);

        return empObj;
    } catch (error) {
        console.error("Failed to fetch employment data:", error);
        return {};
    }
}

//=======================RENT HISTORY DATA=========================
export async function fetchRentHistory(municipalityCode) {
    const code = String(municipalityCode).padStart(3, "0");
    const queryPayload = {
        query: [
            {
                code: "alue_44_20260101",
                selection: {
                    filter: "item",
                    values: [code]
                }
            },
            {
                code: "rahoitus_2_20260101",
                selection: {
                    filter: "item",
                    values: ["SSS"] // total funding types
                }
            },
            {
                code: "huoneluku_5_20260101",
                selection: {
                    filter: "item",
                    values: ["SSS"] // all room types
                }
            },
            {
                code: "timeperiod_q",
                selection: {
                    filter: "all",
                    values: ["*"]
                }
            },
            {
                code: "contentscode",
                selection: {
                    filter: "item",
                    values: ["asvu_keskineliovuokra"]
                }
            }
        ],
        response: {
            format: "json-stat2"
        }
    };
    try {
        const response = await fetch(RENT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(queryPayload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Rent history API error ${response.status}: ${errorText}`
            );
        }
        const pxData = await response.json();
        const quarters = Object.entries(
            pxData.dimension.timeperiod_q.category.index
        ).sort((a, b) => a[1] - b[1]);
        const history = quarters.map(([quarter, quarterIndex]) => {
            const coordinates = pxData.id.map((dimensionId) => {
                const dimension = pxData.dimension[dimensionId];
                if (dimensionId === "timeperiod_q") {
                    return quarterIndex;
                }
                return Object.values(dimension.category.index)[0];
            });
            let valueIndex = 0;
            coordinates.forEach((coordinate, i) => {
                const multiplier = pxData.size
                    .slice(i + 1)
                    .reduce((product, size) => product * size, 1);

                valueIndex += coordinate * multiplier;
            });
            const rawValue = pxData.value[valueIndex];
            return {
                quarter,
                rent: rawValue == null ? null : Number(rawValue)
            };
        });
        console.log("Rent History Data:", history);
        return history;
    } catch (error) {
        console.error("Failed to fetch rent history data:", error);
        return [];  // fixed: empty list, not {}
    }
}