# nordwise — Where should I live in Finland!?

A small web app that shows population, average rent and employment rate for Finnish municipalities on a map and in charts. Made for the web development course project @LUT uni.

**Live demo:** https://phamduchaianh.github.io/nordwise/

## Features

- Map of all Finnish municipalities, coloured by the selected data (population, rent, employment rate)
- Legend and hover tooltip on the map
- Click a municipality to see its information and a rent history chart
- Comparison chart: choose the data, lowest or highest, and how many municipalities
- Rent history chart can be shown as a line or a bar chart
- Drag a data chip onto the map or onto the comparison chart to change the data
- Make your own data by doing a calculation (+, −, ×, ÷) on a dataset. The result becomes a new chip
- Download the charts as SVG images
- Works on desktop and mobile (tap a data chip instead of dragging)

## How to use

1. Pick a layer from the list above the map, or drag a data chip onto the map.
2. Click a municipality on the map. Its information shows on the right and the rent history chart is drawn.
3. Use the dropdowns in the comparison chart to change the data and the number of bars.
4. To make new data, choose a dataset and a calculation in the "Make your own data" box and press Create.
5. Press "Download SVG" under a chart to save it.
6. Press "Reset zoom" to go back to the whole country.

On a phone, dragging does not work, so tap a data chip. It changes both the map and the comparison chart.

## Tools

- HTML, CSS and JavaScript (no framework)
- [Leaflet](https://leafletjs.com/) for the map
- [Frappe Charts](https://frappe.io/charts) for the charts

## Data sources

All data is from Statistics Finland (Tilastokeskus):

- Municipality borders (GeoJSON): geo.stat.fi WFS
- Population: StatFin table 11ra
- Average rent: StatFin table 15fa
- Employment rate: StatFin table 115x

## Folder structure

```
nordwise/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js      main file, connects everything
    ├── api.js      fetches data from the APIs
    ├── data.js     keeps the datasets and makes new data
    ├── map.js      Leaflet map, colours and legend
    └── charts.js   Frappe charts and SVG download
```

## Browser support

Tested on Chrome, Edge, Firefox and Safari (latest versions).

## Known limitations

- Rent is the average price per m² of the whole municipality, so a calculation like rent × m² is only an estimate.
- Some small municipalities have no rent or employment data. They are grey on the map.
- Data chips made by the user are not saved when the page is reloaded.
- Dragging with the mouse works on desktop only. Phones use tap.

## Author
Duc Hai Anh Pham
