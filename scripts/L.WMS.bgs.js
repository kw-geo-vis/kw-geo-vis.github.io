/**
 * Andrew Bean
 * July 2016
 *
 * Extends L.WMS.Source to support styling of getFeature
 * info requests for BGS WMS service and deals with
 * cross-origin request issues
 *
 * Usage:
 *	Ass per L.WMS.Source
 * 
 * Prerequisites: 	leaflet-src.js (Leaflet.js main library)
 * 					leaflet.wms.js (Leaflet WMS library)
 *
 * Ref: https://github.com/heigeo/leaflet.wms
 */
L.WMS.Bgs = L.WMS.Source.extend({
	
	initialize: function (url, options) {
        L.WMS.Source.prototype.initialize.call(this,url, options);
    },
	
	//Ajax request for getFeatureInfo will fail as BGS WMS server does not
	//have 'Access-Control-Allow-Origin' header set.  If ajax request fails
	//plugin defaults to loading data in an iframe.  Here, the ajax call is
	//skipped by immediately returning an 'error' callback allowing the iframe
	//to be loaded straight away
	ajax: function(url, callback) {
		callback.call(this,"error");
	},
	
	//As we have to load the getFeatureInfo in an iframe we can't grab the data
	//and style it on the client side.  Need to send an xsl template stylesheet
	//as part of the getFeatureInfo request to style the returned data on the server
	getFeatureInfoParams: function(point, layers) {	
		// Hook to generate parameters for WMS service GetFeatureInfo request
        var wmsParams, overlay;
        if (this.options.untiled) {
            // Use existing overlay
            wmsParams = this._overlay.wmsParams;
        } else {
            // Create overlay instance to leverage updateWmsParams
            overlay = this.createOverlay(true);
            overlay.updateWmsParams(this._map);
            wmsParams = overlay.wmsParams;
            wmsParams.layers = layers.join(',');
        }
        var infoParams = {
            'request': 'GetFeatureInfo',
			'info_format' : 'text/html',
            'query_layers': layers.join(','),
            'X': Math.round(point.x),
            'Y': Math.round(point.y),
			
			//Add Custom xsl template
			'&xsl_template' : 'http://andrew-bean.co.uk/featureinfo_template.xsl',
        };
        return L.extend({}, wmsParams, infoParams);
	},
	
	showFeatureInfo: function(latlng, info) {
        // Hook to handle displaying parsed AJAX response to the user
        if (!this._map) {
            return;
        }
		
		var popup = L.responsivePopup({
			minWidth: 300,
			className: 'popup popup--Bedrock',
			extContainer: this.options.extCont
		}).setContent(info).setLatLng(latlng);
		popup.openOn(this._map);
		
       // this._map.openPopup(info, latlng);
    },
});

L.WMS.bgs = function (url, options) {
    return new L.WMS.Bgs(url, options);
};