const GEO_JSON_API = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet%3Akunta4500k&outputFormat=application%2Fjson&srsName=EPSG%3A4326";

const POPULATION_API = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/vaerak/11ra.px"

//fetch geo json
export async function fetchGeoJson() {
    try {
        const response = await fetch(GEO_JSON_API);
        if (!response.ok) throw new Error("HTTP error! status: ${response.status}");    //error handling
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


async function fetchPopulation() {
    const response = await fetch(POPULATION_API);
    console.log(response);
    return await response.json();
}