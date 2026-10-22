export function initMap(){
    const map = L.map("map", {
        minZoom: 2
    }).setView([61.9241, 25.7482], 5);  // initial coordiante

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
}

//render map function
export function renderMap(map, geoJsonData, onRegionClick) {
    return L.geoJson(geoJsonData, {
        style: {
            fillColor: '#3182ce',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.4
        },
        onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const cityName = props.nimi || props.name || 'Unknown';
            const kuntaCode = props.kunta;

            layer.on({
                mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({
                        weight: 2,
                        color: '#1a365d',
                        fillOpacity: 0.7
                    });
                    l.bringToFront();
                },
                mouseout: (e) => {
                    e.target.setStyle({
                        weight: 1,
                        color: 'white',
                        fillOpacity: 0.4
                    });
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
}
