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
	map.setView(new L.LatLng(52.878997, -1.078088), 16);

	// Create an ESRI geocoding control and add it to the map
	var searchControl = L.esri.Geocoding.geosearch({
		zoomToResult: false, //We will navigate to location later
		providers: [L.esri.Geocoding.arcgisOnlineProvider({
			countries: "GBR"
		})],
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

	var t_record = _.template('\
	<div class="record">	\
	<div class="record__head">	\
		<h2 class="record__type"><%= record.Type %></h2>	\
	</div>	\
	<div class="record__body">	\
		<div class="record__details">	\
			<h3 class="record__title"><%= record.Name %> (<%= record.Species %>)</h3>	\
			<p class="record__coords">(52.87380503, -1.072624763) WGS84</p>	\
			<p class="record__text">	\
				Recorded by: <span><%= record["Recorded by"] %></span><br/>	\
				Date: <span><%= record.Date %></span><br/>Time: <span><%= record["Time"] %></span>	\
			</p>	\
		</div>	\
		<img src="data/<%= record["Image"] %>" alt="Limestone" class="record__img">	\
	</div>	\
	</div>');

	//http://spatialreference.org/ref/epsg/27700/
	//proj4 already knows about WGS84 so no need to redefine
	proj4.defs([
		[
			'EPSG:27700',
			'+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs '
		],
	]);

	function parseFile(filename, layers, icons) {
		Papa.parse('./data/' + filename, {
			download: true,
			header: true,
			dynamicTyping: true,
			complete: function(results) {
				for (var i = 0; i < results.data.length - 1; i++) {
					var record = results.data[i];

					if (!('Latitude (WGS84)' in record)) {
						var lnglat = proj4('EPSG:27700', 'WGS84').forward([record.X, record.Y]);
						record['Latitude (WGS84)'] = lnglat[1];
						record['Longitude (WGS84)'] = lnglat[0];
					}

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
					var popup = L.popup({
						minWidth: 300,
						className: 'popup popup--' + record['Type']
					}).setContent(t_record({
						record: record
					}));
					console.log([record['Latitude (WGS84)'], record['Longitude (WGS84)']]);
					marker.bindPopup(popup);
					console.log(record['Type']);
					layers[record['Type']].addLayer(marker);
					console.log(record);
				}
			}
		});
	}

	var layers = {}
	layers.Fossil = L.layerGroup().addTo(map);
	layers.Measurement = L.layerGroup().addTo(map);
	layers.Borehole = L.layerGroup().addTo(map);
	layers.Rock = L.layerGroup().addTo(map);

	var icons = {}
	icons.Fossil = 'marker-icon-fossil.png';
	icons.Measurement = 'marker-icon-measurement.png';
	icons.Borehole = 'marker-icon-borehole.png';
	icons.Rock = 'marker-icon-rock.png';

	parseFile('fossil.txt', layers, icons);
	parseFile('measurement.txt', layers, icons);
	parseFile('borehole.txt', layers, icons);
	parseFile('rock.txt', layers, icons);

});