function caMap(el, data) {
	this.el = el;
	this.geocoder = new google.maps.Geocoder();
	this.map = new google.maps.Map(el[0], this.mapOptions);
	this.infowindow = new google.maps.InfoWindow({
		content: ''
	});
	if (data.length > 0) this.load(data);
};

caMap.prototype.mapOptions = {
	center: new google.maps.LatLng(40.7933, -77.8603),
	zoom: 16,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

caMap.prototype.event_metadata = ['title', 'start', 'end', 'people', 'relation'];
caMap.prototype.annotation_metadata = ['text', 'people', 'relation'];
caMap.prototype.reload = function(data) {
	this.map = new google.maps.Map(this.el[0], this.mapOptions);
	if (data.length > 0) this.load(data);
};

caMap.prototype.newMarker = function(param) {
	var _this = this;
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(param.lat, param.lng),
		map: _this.map,
		title: param.location
	});
	google.maps.event.addListener(marker, 'mouseover', function() {
		ajax_request('/maps/location/' + encodeURIComponent(marker.getTitle()), 'GET', "ca_case_id=" + ca_case_id, function(infos) {
			if (infos.eve_loc.length > 0 || infos.ann_loc.length > 0) {
				var contentString = '<div id="markerballoon"><p><b>' + marker.getTitle() + '</b></p>';
				contentString += '<p><b>Events related to this location:</b><br>'
				var eventcontent = '';
				for (var i in infos.eve_loc) {
					eventcontent = '';
					Object.keys(infos.eve_loc[i]).forEach(function(attr) {
						if (_this.event_metadata.indexOf(attr) > -1 && infos.eve_loc[i][attr]) {
							switch (attr) {
							case 'start':
								eventcontent += "FROM: " + infos.eve_loc[i][attr] + " ";
								break;
							case 'end':
								eventcontent += "TO: " + infos.eve_loc[i][attr] + " ";
								break;
							case 'people':
								if (type(infos.eve_loc[i][attr]) == 'Array') {
									var p = '';
									for (var j = 0; j < infos.eve_loc[i][attr].length; j++) {
										p += infos.eve_loc[i][attr][j] + ' ';
									}
									eventcontent += attr + ": " + p + " ";
								} else {
									eventcontent += attr + ": " + infos.eve_loc[i][attr] + " ";
								}
								break;
							default:
								eventcontent += attr + ": " + infos.eve_loc[i][attr] + " ";
								break;
							}
						}
					})
					eventcontent += '<br>';
					contentString += eventcontent;
				}
				contentString += '</p>';
				contentString += '<p><b>Annotations related to this location:</b><br>'
				var annotationcontent = '';
				for (var i in infos.ann_loc) {
					annotationcontent = '';
					Object.keys(infos.ann_loc[i]).forEach(function(attr) {
						var x=infos.ann_loc[i][attr];
						var y = _this.annotation_metadata.indexOf(attr);
						if (y > -1 &&x) {
							switch (attr) {
							case 'people':
								if (type(infos.ann_loc[i][attr]) == 'Array') {
									var p = infos.ann_loc[i][attr][j].join();

									annotationcontent += attr + ": " + p + " ";
								} else {
									annotationcontent += attr + ": " + infos.ann_loc[i][attr] + " ";
								}
								break;
							default:
								annotationcontent += attr + ": " + infos.ann_loc[i][attr] + " ";
								break;
							}
						}
					})
					annotationcontent += '<br>';
					contentString += annotationcontent;
				}
				contentString += '</p></div>';
				_this.infowindow.setContent(contentString);
				_this.infowindow.open(_this.map, marker);
			} else {
				var contentString = '<div id="markerballoon"><p><b>' + marker.getTitle() + '</b></p></div>';
			}
		})
	})
	return marker;
};

caMap.prototype.load = function(data) {
	for (var d = 0; d < data.length; d++) {
		var loc = data[d];

		this.newMarker({lat: loc.lat, lng: loc.lng, location: loc.location});
	}
};

caMap.prototype.placeMarker = function(position, title) {
	this.newMarker({
		lat: position.lat,
		lng: position.lng,
		location: title
	})
};

caMap.prototype.mouseOverMarker = function(marker) {
	var _this = this;

}
