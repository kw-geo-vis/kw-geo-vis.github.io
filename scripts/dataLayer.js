/**
 * Andrew Bean
 * July 2016
 *
 * Creates leaflet layers containing the data enclosed in
 * sample CSV files
 *
 * Usage:
 *	DataLayer.init()
 *		Sets up leaflet layers for the following sample files:
 *			data/borehole.txt
 *			data/fossil.txt
 *			data/measurement.txt
 *			data/rock.txt
 *
 *	layers are accessible as DataLayer.layers
 * 
 * Prerequisites: 	leaflet-src.js (Leaflet.js main library)
 * 					underscore.js (Accessory and template library)
 * 					proj4-src.js (Convert coordinate projections)
 *					papaparse.js (CSV parsing library)
 */
var DataLayer = {

	settings: {
		extPopupContainer: 'extPopup'
	},

	layers: {},
	icons: {},
	extPopup: undefined,
	popupTemplate: {},
	dataBounds: undefined,

	//Layers for each data file to enable individual controls
	_initLayers: function() {
		this.layers.Fossil = L.layerGroup();
		this.layers.Measurement = L.layerGroup();
		this.layers.Borehole = L.layerGroup();
		this.layers.Rock = L.layerGroup();
	},
	
	//Initialise data Bounds to aid in searches
	_initDataBounds: function(map) {
		//Bounds include center of map but no data yet
		this.dataBounds = L.latLngBounds(map.getCenter(), map.getCenter());
	},
	
	//Custom icons for data types
	_initIcons: function() {
		this.icons.Fossil = 'marker-icon-fossil.png';
		this.icons.Measurement = 'marker-icon-measurement.png';
		this.icons.Borehole = 'marker-icon-borehole.png';
		this.icons.Rock = 'marker-icon-rock.png';
	},

	//Setup responsive external popup
	_initExtPopup: function() {
		this.extPopup = L.DomUtil.get(this.settings.extPopupContainer);
		L.DomUtil.addClass(this.extPopup, 'hidden');
	},

	//We will need to convert from EPSG:27700 (BNG) to WGS84
	_initProjections: function() {
		//http://spatialreference.org/ref/epsg/27700/
		//proj4 already knows about WGS84 so no need to redefine
		proj4.defs([
			[
				'EPSG:27700',
				'+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs '
			],
		]);
	},

	// underscore.js Template for displaying data record
	// HTML is structured using BEM (http://getbem.com/introduction/)
	// style namings for modularity
	_setupTemplate: function() {
		this.popupTemplate = _.template('\
	<div class="record">	\
	<div class="record__head">	\
		<h2 class="record__type"><%= record.Type %></h2>	\
	</div>	\
	<div class="record__body">	\
		<div class="record__details">	\
			<h3 class="record__title"><%= record.Name %>	\
				<% if(!_.isUndefined(record.Species)) { %>	\
					(<%= record.Species %>)	\
				<% } else if(!_.isUndefined(record["Rock name"])) { %>	\
					(<%= record["Rock name"] %>)	\
				<% } %> \
			</h3>	\
			<div class="record__coords">(<% print(Math.round(record["Latitude (WGS84)"]*Math.pow(10,8))/Math.pow(10,8)) %>, <% print(Math.round(record["Longitude (WGS84)"]*Math.pow(10,9))/Math.pow(10,9)) %>) WGS84<br/> \
			</div>	\
			<p class="record__text">	\
				Height Elevation: <span><%= record["Z"] %>m</span><br/> \
				Recorded by: <span><%= record["Recorded by"] %></span><br/>	\
				Date: <span><%= record.Date %></span><br/>Time: <span><%= record["Time"] %></span><br/>	\
				<% if(!_.isUndefined(record["Drilled depth (m)"])) { %>	\
					Drilled Depth (m): <span><%= record["Drilled depth (m)"] %></span><br/>	\
				<% } %>	\
				<% if(!_.isUndefined(record["Porosity"])) { %>	\
					Porosity: <span><%= record["Porosity"] %></span><br/>	\
				<% } %>	\
			</p>	\
		</div>	\
		<% if(!_.isUndefined(record["Image"])) { %>	\
			<img src="data/<%= record["Image"] %>" alt="<% !_.isUndefined(record["Rock name"]) ? print(record["Rock name"]) : print(record["Species"]) %>" class="record__img">	\
		<% } %>	\
	</div>	\
	</div>');
	},

	//Parse CSV data file and create layer.  In simple implementation
	//assumes files are well formatted.  In a larger system a DB or other
	//Web map system may be used but here we live parse the CSVs
	_parseFile: function(filename, layers, icons, template, extCont) {
		Papa.parse(filename, {
			download: true,
			header: true,
			dynamicTyping: true,
			complete: function(results) {
				for (var i = 0; i < results.data.length - 1; i++) {
					var record = results.data[i];

					//If no WGS84, assume data in BNG.  Leaflet and OSM in
					//WGS84 so convert to WGS84
					if (!('Latitude (WGS84)' in record)) {
						var lnglat = proj4('EPSG:27700', 'WGS84').forward([record.X, record.Y]);
						record['Latitude (WGS84)'] = lnglat[1];
						record['Longitude (WGS84)'] = lnglat[0];
					}

					//Create the marker
					var icon = L.icon({
						iconUrl: 'imgs/' + icons[record['Type']],
						shadowUrl: 'imgs/marker-shadow.png',
						iconSize: [25, 41],
						iconAnchor: [12, 41],
						popupAnchor: [1, -34],
						tooltipAnchor: [16, -28],
						shadowSize: [41, 41]
					});
					var marker = L.marker([record['Latitude (WGS84)'], record['Longitude (WGS84)']], {
						icon: icon
					});
					//Setup data info popup using HTML template
					var popup = L.responsivePopup({
						minWidth: 300,
						className: 'popup popup--' + record['Type'],
						extContainer: extCont
					}).setContent(template({
						record: record
					}));
					marker.bindPopup(popup);
					layers[record['Type']].addLayer(marker);
					
					DataLayer.dataBounds.extend([record['Latitude (WGS84)'], record['Longitude (WGS84)']]);
				}
			}
		});
	},
	
	//Parse the 4 data files
	_parseFiles: function() {
		this.parseLocalFile('fossil.txt');
		this.parseLocalFile('measurement.txt');
		this.parseLocalFile('borehole.txt');
		this.parseLocalFile('rock.txt');
	},
	
	//Parse a file from FileInput object (i.e from <input type="file">)
	parseInputFile: function(file) {
		this._parseFile(file, this.layers, this.icons, this.popupTemplate, this.extPopup);
	},
	
	//Parse a local csv stored in the data directory
	parseLocalFile: function(file) {
		this._parseFile('./data/' + file, this.layers, this.icons, this.popupTemplate, this.extPopup);
	},
	
	//Create button to parse user data files
	_createFileUpload: function(map) {
	
		//Create upload control
		var ulControl = L.Control.extend({
			options: {
					position: 'bottomright' 
			},
 
			onAdd: function (map) {
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom fileUploader');
				container.style.backgroundColor = 'white';
				container.style.height = '36px';
	
				var input = L.DomUtil.create('input', 'fileUploader__input',container);
				input.type = 'file';
	
				L.DomEvent.addListener(input, 'change', function(e){
					DataLayer.parseInputFile(e.target.files[0]);
					e.target.value = null;
				});
 
				container.onclick = function(){
					if(L.DomUtil.hasClass(container,'fileUploader--open'))
					{
						L.DomUtil.removeClass(container,'fileUploader--open');
					}
					else
					{
						L.DomUtil.addClass(container,'fileUploader--open');
					}
				}
				return container;
			},
		});
		
		map.addControl(new ulControl());
	},
	
	init: function(map) {
		// kick things off
		this._initLayers();
		this._initIcons();
		this._initDataBounds(map);
		this._initExtPopup();
		this._initProjections();
		this._setupTemplate();
		this._parseFiles();
		this._createFileUpload(map);
	}

};