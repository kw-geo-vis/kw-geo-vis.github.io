/**
 * Andrew Bean
 * July 2016
 *
 * Extends L.Popup to duplicate popup contents into an external container
 * external container can be used to display popup content fullscreen at
 * small breakpoints without altering map state or reversing CSS transforms
 * in map popup layer
 *
 * Usage:
 *	As per L.Popup
 *		Pass HTMLElement reference to external container as 'extContainer'
 *		option to L.ResponsivePopup constructor
 * 
 * Prerequisites: leaflet-src.js (Leaflet.js main library)
 *
 * Ref: See https://github.com/CloudMade/Leaflet/blob/master/src/layer/Popup.js
 */
 
L.ResponsivePopup = L.Popup.extend({
		
		//https://github.com/CloudMade/Leaflet/blob/master/src/layer/Popup.js
		
		onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initLayout();
		}
		this._updateContent();

		var animFade = map.options.fadeAnimation;

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 0);
		}
		map._panes.popupPane.appendChild(this._container);

		map.on('viewreset', this._updatePosition, this);

		if (this._animated) {
			map.on('zoomanim', this._zoomAnimation, this);
		}

		if (map.options.closePopupOnClick) {
			map.on('preclick', this._close, this);
		}

		this._update();

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 1);
		}		
	},
		
	_update: function () {
		 if (!this._map) { return; }			
		this._container.style.visibility = 'hidden';
		this._updateContent();
		this._updateLayout();
		this._updatePosition();
		this._container.style.visibility = '';
		this._adjustPan();
			
		this.options.extContainer.innerHTML = this._content;
		var closeButton = L.DomUtil.create('a', 'close-button', this.options.extContainer);
		closeButton.href = '#close';
		closeButton.innerHTML = '&#215;';
		L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
		
		L.DomUtil.removeClass(this.options.extContainer,'hidden');
		L.DomUtil.addClass(this.options.extContainer,'open');
	},
	
	_close: function () {
		var map = this._map;

		if (map) {
			map._popup = null;

			map
			    .removeLayer(this)
			    .fire('popupclose', {popup: this});
		}
		
		L.DomUtil.removeClass(this.options.extContainer,'open');
		L.DomUtil.addClass(this.options.extContainer,'hidden');	
	},

});
	
	//Create class factory for responsive popup
	//http://leafletjs.com/reference.html#class
	L.responsivePopup = function(options)
	{
		return new L.ResponsivePopup(options);
	}