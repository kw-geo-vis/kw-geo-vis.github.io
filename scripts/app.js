document.addEventListener("DOMContentLoaded", function (event) {

    KWMap.init();
    DataLayer.init();
	ExtraLayer.init();
    KWMap.addLayers(DataLayer.layers);
	KWMap.addLayers(ExtraLayer.layers);

});