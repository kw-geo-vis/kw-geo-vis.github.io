/**
 * Andrew Bean
 * July 2016
 *
 * Adds extra BGS data layers to the map
 *
 * Usage:
 *	ExtraLayer.init()
 *		Sets up leaflet layers for the following data:
 *			- On Shore Digital Maps (WMS)
 *
 *	layers are accessible as ExtraLayer.layers
 * 
 * Prerequisites: 	leaflet-src.js (Leaflet.js main library)
 * 					leaflet.wms.js (Leaflet WMS library)
 * 					L.WMS.bgs.js (Extension to L.WMS library)
 */
 var ExtraLayer = {

	settings: {
		extPopupContainer: 'extPopup'
	},

	layers: {},
	extPopup: undefined,
	
	//Layers for each data file to enable individual controls
	_initLayers: function() {
		this.layers.BedRock = L.layerGroup();
		
		// BGS WMS service for onshore digital maps does not provide a legend image
		// (https://map.bgs.ac.uk/bgs_wms/legends/digmapgb50.gif)
		// Therefore need to use getFeatureInfo to find details of map polygons served
		// by WMS server
		//
		// L.tileLayer.wms does not have support for getFeatureInfo
		// therefore using leaflet.wms.js (https://github.com/heigeo/leaflet.wms)
		//
		// L.WMS.bgs extends L.WMS.source to style returned feature info data and deal
		// with Cross-Origin request issues.
		var options = {
			layers: 'BGS.50k.Bedrock',
			format: 'image/png',
			opacity: 0.7,
			transparent: true,
			attribution: "Contains British Geological Survey materials copyright NERC 2016",
			extCont: this.extPopup
		};
		
		var layer1 = L.WMS.bgs("https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?", options);
		layer1.addSubLayer("BGS.50k.Bedrock");
		
		layer1.addTo(this.layers.BedRock);
	},

	//Setup responsive external popup
	_initExtPopup: function() {
		this.extPopup = L.DomUtil.get(this.settings.extPopupContainer);
		L.DomUtil.addClass(this.extPopup, 'hidden');
	},
	
	init: function() {
		// kick things off
		this._initExtPopup();
		this._initLayers();
	}

};