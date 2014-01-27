function caPeople() {
	var _this = this;
	this.people_list = [];
	this.relation_list = [];
	$.get('/people/'+window.ca_case_id, function(data){
		for(var i=0; i<data.length; i++){
			_this.people_list.push(data[i].name);
		}
	})
	$.get('/relations/'+window.ca_case_id, function(data){
		for(var i=0; i<data.length; i++){
			_this.relation_list.push(data[i].relation);
		}
	})
}