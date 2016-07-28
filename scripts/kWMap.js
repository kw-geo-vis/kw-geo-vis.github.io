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
	
	checkAndNavigateToSearchReuslts: function(result) {
		
		var padBound = DataLayer.dataBounds.pad(0.5);
		if(padBound.contains(result.latlng))
		{
			this.map.panTo(result.latlng);
		}
		else
		{
			this.map.fire('modal', {
				title: 'Are you sure?',
				content: 'The location you have selected is not in the vacinity of any data points.  Navigate there anyway?',
				template: ['<div class="modal-header"><h2>{title}</h2></div>',
				'<hr>',
				'<div class="modal-body">{content}</div>',
				'<div class="modal-footer">',
					'<button class="topcoat-button--large {OK_CLS}">{okText}</button>',
					'<button class="topcoat-button--large {CANCEL_CLS}">{cancelText}</button>',
				'</div>'
				].join(''),
				okText: 'Yes',
				cancelText: 'No',
				OK_CLS: 'modal-ok',
				CANCEL_CLS: 'modal-cancel',

				width: 300,

				onShow: function(evt) {
					var modal = evt.modal;
					L.DomEvent
					.on(modal._container.querySelector('.modal-ok'), 'click', function() {
							KWMap.map.panTo(result.latlng);
							modal.hide();
					})
					.on(modal._container.querySelector('.modal-cancel'), 'click', function() {
							//Do Nothing
							modal.hide();
					});
				}
			});
		}
	},

	_displaySearchResults: function() {
		// Create an empty layer group to store the search location and add it to the map
		var results = L.layerGroup().addTo(this.map);
		var map = "map";

		// listen for the results event and add every result to the map
		this.searchControl.on("results", function(data) {
			console.log(data);
			results.clearLayers();
			for (var i = data.results.length - 1; i >= 0; i--) {
				var marker = L.marker(data.results[i].latlng);
				marker.bindPopup("<strong>Search Result:</strong> " + data.text);
				results.addLayer(marker);
				KWMap.checkAndNavigateToSearchReuslts(data.results[i]);  
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