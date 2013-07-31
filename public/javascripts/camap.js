function caMap(el, data) {
	this.geocoder = new google.maps.Geocoder();
	this.markers = [];
	this.map = new google.maps.Map(el[0], this.mapOptions);
	this.infowindow = new google.maps.InfoWindow({content:''});
	if(data.length > 0) this.load(data);
};

caMap.prototype.mapOptions = {
      center: new google.maps.LatLng(40.7933, -77.8603),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
};

caMap.prototype.event_metadata = ['title','start','end', 'people', 'relationship'];

caMap.prototype.load = function(data){
	var _this = this;
	
	var d = 0;
	for(d=0; d<data.length; d++) {
			var loc = data[d];
		  var marker = new google.maps.Marker({
			position: new google.maps.LatLng(loc.lat, loc.lng),
			map: _this.map,
			title: data[d].location
		})
		this.mouseOverMarker(marker);
	}
};

caMap.prototype.mouseOverMarker = function(marker) {
	var _this = this;
	google.maps.event.addListener(marker, 'mouseover', function(){
		var params = "cid="+cid;
		ajax_request('/maps/location/'+encodeURIComponent(marker.getTitle()), 'GET', params, function(infos){
				if(infos.length > 0){
				var contentString = '<div id="markerballoon"><p><b>' + marker.getTitle() + '</b></p>';
				contentString += '<p><b>Events at this location:</b><br>'
				var eventcontent = '';
				for(var i in infos){
					eventcontent = '';
					Object.keys(infos[i]).forEach(function(attr){
						if(_this.event_metadata.indexOf(attr) > -1 && infos[i][attr]!='undefined' && infos[i][attr]!=null && infos[i][attr]!='' && infos[i][attr]!= 0) {
							switch(attr) {
								case 'start': 
									eventcontent += "FROM: " + infos[i][attr] + " ";
									break;
								case 'end':
									eventcontent += "TO: " + infos[i][attr] + " ";
									break;
								case 'people':
									if(type(infos[i][attr]) == 'Array') {
										var p = '';
										for(var j=0; j<infos[i][attr].length; j++){
											p += infos[i][attr][j] + ' ';
										}
									  eventcontent += attr + ": " + p + " ";
									} else {
										eventcontent += attr + ": " + infos[i][attr] + " ";
									}
									break;
								default:
									eventcontent += attr + ": " + infos[i][attr] + " ";
									break;
							}
						}
					})
					eventcontent += '<br>';
					contentString += eventcontent;
				}
				contentString += '</p></div>'
				_this.infowindow.setContent(contentString);
				_this.infowindow.open(_this.map, marker);
			} else {
				var contentString = '<div id="markerballoon"><p><b>' + marker.getTitle() + '</b></p></div>';
			}
		})
	})
}
