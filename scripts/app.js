var map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
	minZoom: 8,
}).addTo(map);

//Center map view on BGS Keyworth
map.setView(new L.LatLng(52.878997,-1.078088),16);
