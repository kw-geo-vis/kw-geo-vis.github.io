document.addEventListener("DOMContentLoaded", function (event) {

    KWMap.init();
    DataLayer.init(KWMap.map);
	ExtraLayer.init();
    KWMap.addLayers(DataLayer.layers);
	KWMap.addLayers(ExtraLayer.layers);

});