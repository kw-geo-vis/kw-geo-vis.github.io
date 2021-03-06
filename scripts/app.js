document.addEventListener("DOMContentLoaded", function (event) {

	//Initialise and setup application
    KWMap.init();
    DataLayer.init(KWMap.map);
	ExtraLayer.init();
	
	//Add data layers
    KWMap.addLayers(DataLayer.layers);
	KWMap.addLayers(ExtraLayer.layers);
	
	//Setup logo to recenter map
	document.getElementById('logo').addEventListener('click',function(){KWMap.resetCenter();});
	
	//Setup credits link
	document.getElementById('credits').addEventListener('click',function(){KWMap.displayCredits();});
	
	//Keep track of current zoom level
	KWMap.map.on('zoomstart', function(e) {
		KWMap.currZoom = this.getZoom();
	});
	
	//If zoom level outside of range for BGS overlays, alert the user.
	KWMap.map.on('zoomend', function (e) { 
		if(this.getZoom() <= 12 & this.getZoom() < KWMap.currZoom) 
			if(this.hasLayer(ExtraLayer.layers.BedRock) || this.hasLayer(ExtraLayer.layers.Superficial) || this.hasLayer(ExtraLayer.layers.Artificial))
			{
				this.fire('modal', {
				template: ['',
					'BGS data layers are not visible at this zoom level.  Zoom in further to view them.',
				].join(''),		
				});
			}
	});

	//And we're done!
});