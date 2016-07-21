document.addEventListener("DOMContentLoaded", function(event) { 


	L.Icon.Default.imagePath = './imgs';
	
	//Create Leaflet map object and setup OSM map tiles
	var map = L.map('map');
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
		maxZoom: 18,
		minZoom: 8,
	}).addTo(map);

//Center map view on BGS Keyworth
map.setView(new L.LatLng(52.878997,-1.078088),16);

    // Create an ESRI geocoding control and add it to the map
    var searchControl = L.esri.Geocoding.geosearch({
		zoomToResult: false, //We will navigate to location later
        providers: [L.esri.Geocoding.arcgisOnlineProvider({countries: "GBR"})],
		useMapBounds: false,
		expanded: true,
		collapseAfterResult: false,
		position: "topright",
    }).addTo(map);

    // Create an empty layer group to store the search location and add it to the map
    var results = L.layerGroup().addTo(map);
	
    // listen for the results event and add every result to the map
    searchControl.on("results", function(data) {
        results.clearLayers();
        for (var i = data.results.length - 1; i >= 0; i--) {
            results.addLayer(L.marker(data.results[i].latlng));
        }
    });
});
