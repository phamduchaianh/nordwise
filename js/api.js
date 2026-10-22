const GEO_JSON_API = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet%3Akunta4500k&outputFormat=application%2Fjson&srsName=EPSG%3A4326";

const POPULATION_API = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/vaerak/11ra.px";

const RENT_API = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/asvu/15fa.px";

//fetch geo json
export async function fetchGeoJson() {
    try {
        const response = await fetch(GEO_JSON_API);
        if (!response.ok) throw new Error('HTTP error! status: ${response.status}');    //error handling
        return await response.json();   //return feature collection
    } catch(error){
        console.error("Geo Json API failed:", error);
        throw error;
    }
}
//log data
fetchGeoJson().then((data) => {
    console.log("Features:", data.features.length);
    console.log("First municipality:", data.features[0].properties);
  }).catch(console.error);


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
                    "values": ["vaerak-vaesto"] // Population 31 Dec
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
        Object.entries(areaCodes).forEach(([codeWithKU, index]) => {
            // seperate KU -> code
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

            // Bỏ qua nếu không có dữ liệu
            if (rentVal === null || rentVal === undefined) return;

            // 1. Tách lấy 3 chữ số đầu tiên (VD: "091_1" -> "091", "398" -> "398")
            const cleanCode = rawCode.split('_')[0];

            // 2. Chỉ lấy các mã là mã Kunta (chứa toàn số 3 chữ số, bỏ qua các mã tỉnh như MK01, pks, SSS)
            if (/^\d+$/.test(cleanCode)) {
                const kuntaCode = cleanCode.padStart(3, '0');

                // Nếu chưa có mã này hoặc gặp mã chính của thành phố thì lưu giá trị
                if (!rentObj[kuntaCode] || !rawCode.includes('_')) {
                    rentObj[kuntaCode] = rentVal;
                }
            }
        });

        console.log("Parsed Rent Data Object:", rentObj);
        return rentObj;

    } catch (error) {
        console.error("Failed to fetch rent data:", error);
        return {};
    }
}