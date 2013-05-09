function caMap(el, data) {
	this.geocoder = new google.maps.Geocoder();
	this.markers = [];
	this.map = new google.maps.Map(el[0], this.mapOptions);
	
	if(data.length > 0) this.load(data);
};

caMap.prototype.mapOptions = {
      center: new google.maps.LatLng(40.7933, -77.8603),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
};

caMap.prototype.load = function(data){
	
}

