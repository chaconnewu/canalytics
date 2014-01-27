function caLocation() {
	var _this = this;
	this.location_list = [];

	$.get('/maps/'+window.ca_case_id, function(data){
		for(var i=0; i<data.length; i++){
			_this.location_list.push(data[i].location);
		}
	})
}