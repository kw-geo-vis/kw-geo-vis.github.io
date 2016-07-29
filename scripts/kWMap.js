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
	currZoom: 15,

	resetCenter: function() {
		this.map.setView(new L.LatLng(this.settings.center[0], this.settings.center[1]), 15);
	},
	
	_createMap: function() {
		//Setup leaflet map
		this.map = L.map(this.settings.container);
		L.Icon.Default.imagePath = this.settings.iconDir;

		this.map.attributionControl.setPrefix('');
		
		//Add OSM tilelayer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '',
			maxZoom: this.settings.maxZoom,
			minZoom: this.settings.minZoom,
		}).addTo(this.map);

		//Centre on BGS Keyworth
		this.map.setView(new L.LatLng(this.settings.center[0], this.settings.center[1]), 15);
	},

	_welcomeModal: function() {
		this.map.fire('modal', {
			template: ['',
				'<div class="intro">',
				'<h1 class="intro__head"><div class="logo"><span class="logo__key">KEY</span><span class="logo__vis">vis</span></div></h1>',
				'<p class="intro__text">Welcome to KEYvis.  KEYvis provides easy access to geological information and data from in and around the KeyWorth area.</p>',
				'<img src="imgs/data.gif"  class="intro__img">',
				'<p class="intro__text">Data points available include:</p>',
				'<ul>',				
					'<li>Fossils</li>',
					'<li>Rock samples</li>',
					'<li>Boreholes</li>',
					'<li>Measurements</li>',
				'</ul>',
				'Data associated with samples can be viewed by clicking on a coloured pin.</p>',
				'',
				'<img src="imgs/extra-data.gif" class="intro__img">',
				'<p class="intro__text intro__text--spaced">Additionally, data layers from the <a href="http://bgs.ac.uk">British Geological Survey</a> can be viewed using the "Select Data Layers" tab.</p>',
				'<p class="intro__text intro__text--clear">Project source code can be viewed at <a href="gith">Github</a>.</p>',
			].join(''),		
		});
	},
	
	displayCredits: function() {
		this.map.fire('modal', {
			template: ['',
				'<div class="intro">',
				'<h1 class="intro__head">Credits</h1>',
				'<h2>Mapping</h2>',
				'<p class="intro__text intro__text--tight">Mapping imagery provided by <a href="http://openstreetmap.org/">Open Street Map</a></p>',
				'<p class="intro__text intro__text--tight">Geocoding provided by <a href="https://developers.arcgis.com/en/features/geocoding/">Esri</a></p>',
				'<p class="intro__text intro__text--tight">Mapping interface by <a href="http://leafletjs.com/">leaflet.js</a></p>',
				'<p class="intro__text intro__text--tight">leaflet.js extensions by <a href="https://github.com/">the open source community</a></p>',
				'<h2>Data Processing</h2>',
				'<p class="intro__text intro__text--tight">CSV parsing by <a href="http://papaparse.com/">Papa Parse</a></p>',
				'<p class="intro__text intro__text--tight">CRS conversions by <a href="http://proj4js.org/">proj4js</a></p>',
				'<h2>Additional Datasets</h2>',
				'<p class="intro__text intro__text--tight">Data overlays by <a href="http://bgs.ac.uk/">British Geological Survey</a> &copy; NERC 2016</p>',
				'<h2>Icons</h2>',
				'<p class="intro__text intro__text--tight">"<a href="https://thenounproject.com/term/fossil/57812/">shell</a>" icon by Caitlin McCormick from <a href="http://thenounproject.com/">the Noun Project</a></p>',
				'<p class="intro__text intro__text--tight">"<a href="https://thenounproject.com/term/rock/445138/">rock</a>" icon Artem  Kovyazin from <a href="http://thenounproject.com/">the Noun Project</a></p>',
				'<p class="intro__text intro__text--tight">"<a href="https://thenounproject.com/term/drill/326595/">drill</a>" icon by Marie Van den Broeck from <a href="http://thenounproject.com/">the Noun Project</a></p>',
				'<p class="intro__text intro__text--tight">"<a href="https://thenounproject.com/term/measure/168275/">Tape Measure</a>" icon by Amy Schwartz from <a href="http://thenounproject.com/">the Noun Project</a></p>',
				'<hr>',
				'<p class="intro__text">All other code and design, <a href="https://uk.linkedin.com/in/andrew-bean-2001a591">Andrew Bean</a></p>',
			].join(''),		
		});
	},
	
	_setupGeocoding: function() {
		// Create an ESRI geocoding control and add it to the map
		this.searchControl = L.esri.Geocoding.geosearch({
			zoomToResult: false, //We will navigate to location later
			providers: [L.esri.Geocoding.arcgisOnlineProvider({
				countries: "GBR"
			})],
			attribution: '',
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
		
		var padBound = DataLayer.dataBounds.pad(0.75);
		if(padBound.contains(result.latlng))
		{
			this.map.panTo(result.latlng);
		}
		else
		{
			this.map.fire('modal', {
				title: 'Are you sure?',
				content: 'The location you have selected is not in the vicinity of any data points.  Navigate there anyway?',
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
			
			//Just display/navigate to the hit at the top of the suggest list (end of results array)
			var marker = L.marker(data.results[data.results.length-1].latlng);
			marker.bindPopup("<strong>Search Result:</strong> " + data.text);
			results.addLayer(marker);
			
			KWMap.checkAndNavigateToSearchReuslts(data.results[data.results.length-1]);  		
		});
	},

	//Add all layers within layers object to the map
	addLayers: function(layers) {
		for (var layer in layers) {
			
			//Add collected data layers to map immediately
			this.layerControl.addOverlay(layers[layer],this.settings.layerName[layer][0],this.settings.layerName[layer][1]);
			if(this.settings.layerName[layer][1] == "Collected Data")
			{
				layers[layer].addTo(this.map);
			}
			
			//Add 'empty' additional layer
			if(this.settings.layerName[layer][0] == "No Additional Data")
			{
				layers[layer].addTo(this.map);
			}
			
		}
	
	},

	init: function() {
		// kick things off
		this._createMap();
		this._welcomeModal();
		this._setupGeocoding();
		this._setupLayerControl();
		this._displaySearchResults();
	}

};