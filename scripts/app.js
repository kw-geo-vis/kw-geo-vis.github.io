document.addEventListener("DOMContentLoaded", function (event) {

    KWMap.init();
    DataLayer.init(KWMap.map);
	ExtraLayer.init();
    KWMap.addLayers(DataLayer.layers);
	KWMap.addLayers(ExtraLayer.layers);
	document.getElementById('logo').addEventListener('click',function(){KWMap.resetCenter();});
	
	
	
	KWMap.map.on('zoomstart', function(e) {
		KWMap.currZoom = this.getZoom();
	});
	
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


});