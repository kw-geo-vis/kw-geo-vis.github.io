/**
 * Andrew Bean
 * July 2016
 *
 * Sets up a leaflet map using OSM map tiles and geocoding search
 * provided by ESRI
 *
 * Usage:
 *	KWMap.init()
 *		Sets up leaflet map with Esri geocoding
 *
 *  KWMap.addLayers(layers)
 *		Expects a javascript object containing leaflet layers.
 *		layers are added to map
 * 
 * Prerequisites: 	leaflet-src.js (Leaflet.js main library)
 * 					esri-leaflet.js (ESRI leaflet functions)
 * 					esri-leaflet-geocoder.js (ESRI geocoding functions)
 */

var KWMap = {

	settings: {
		container: 'map',
		maxZoom: 18,
		minZoom: 8,
		center: [52.878997, -1.078088],
		iconDir: './imgs',
		
		layerName: {
			Fossil: ["Fossils","Collected Data"],
			Measurement : ["Measurements","Collected Data"],
			Borehole :["Boreholes","Collected Data"],
			Rock: ["Rocks","Collected Data"],
			Empty: ["No Additional Data","Additional Data"],	
			BedRock: ["BGS Bedrock Data","Additional Data"],		
			Superficial: ["BGS Superficial Deposits Data","Additional Data"],	
			Artificial: ["BGS Artificial Ground","Additional Data"],	
		}
	},
	map: undefined,
	searchControl: undefined,
	layerControl: undefined,

	_createMap: function() {
		//Setup leaflet map
		this.map = L.map(this.settings.container);
		L.Icon.Default.imagePath = this.settings.iconDir;

		//Add OSM tilelayer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
			maxZoom: this.settings.maxZoom,
			minZoom: this.settings.minZoom,
		}).addTo(this.map);

		//Centre on BGS Keyworth
		this.map.setView(new L.LatLng(this.settings.center[0], this.settings.center[1]), 15);
		
		    this.map.fire('modal', {
      content: '<h1>KeyVis</h1><p>Welcome to KEYVis</h1>'
    });
	},

	_setupGeocoding: function() {
		// Create an ESRI geocoding control and add it to the map
		this.searchControl = L.esri.Geocoding.geosearch({
			zoomToResult: false, //We will navigate to location later
			providers: [L.esri.Geocoding.arcgisOnlineProvider({
				countries: "GBR"
			})],
			useMapBounds: false,
			expanded: true,
			collapseAfterResult: false,
			position: "topright",
		}).addTo(this.map);
	},
	
	_setupLayerControl: function() {
		var options = {
			// Make the "Additional Data" group exclusive (use radio inputs)
			exclusiveGroups: ["Additional Data"],
			collapsed: true,
			position: 'bottomleft'
			};
		this.layerControl = L.control.groupedLayers(null, null, options);
		this.layerControl.addTo(this.map);
	},

	_displaySearchResults: function() {
		// Create an empty layer group to store the search location and add it to the map
		var results = L.layerGroup().addTo(this.map);

		// listen for the results event and add every result to the map
		this.searchControl.on("results", function(data) {
			results.clearLayers();
			for (var i = data.results.length - 1; i >= 0; i--) {
				results.addLayer(L.marker(data.results[i].latlng));
			}
		});
	},

	//Add all layers within layers object to the map
	addLayers: function(layers) {
		for (var layer in layers) {
			console.log(layers[layer]);
			console.log(layer);
			
			//Add collected data layers to map immediately
			this.layerControl.addOverlay(layers[layer],this.settings.layerName[layer][0],this.settings.layerName[layer][1]);
			if(this.settings.layerName[layer][1] == "Collected Data")
			{
				layers[layer].addTo(this.map);
			}
			
			//Add 'empty' additional layer
			if(this.settings.layerName[layer][0] == "No Additional Data")
			{
				console.log("ok");
				layers[layer].addTo(this.map);
			}
			
		}
	
	},

	init: function() {
		// kick things off
		this._createMap();
		this._setupGeocoding();
		this._setupLayerControl();
		this._displaySearchResults();
	}

};