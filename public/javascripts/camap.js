function caMap(el, data) {
	this.geocoder = new google.maps.Geocoder();
	this.markers = [];
  this.mapOptions = {
        center: new google.maps.LatLng(40.7933, -77.8603),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

	this.map = new google.maps.Map(el[0], this.mapOptions);
}