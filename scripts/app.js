document.addEventListener("DOMContentLoaded", function (event) {




    KWMap.init();
    DataLayer.init();
    KWMap.addLayers(DataLayer.layers);

});