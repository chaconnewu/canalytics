function caPeople() {
	var _this = this;
	this.people_list = [];
	this.relation_list = [];
<<<<<<< HEAD
    var t = window.ca_case_id;
=======
	this.people_options = [];
	this.relation_options = [];
>>>>>>> 8ea137c7a5f70b340f0bb745374f8cc7906a7e93
	$.get('/people/'+window.ca_case_id, function(data){
		for(var i=0; i<data.length; i++){
			_this.people_list.push(data[i].name);
			_this.people_options.push({value: data[i].name, text: data[i].name});
		}
	})
	$.get('/relations/'+window.ca_case_id, function(data){
		for(var i=0; i<data.length; i++){
			_this.relation_list.push(data[i].relation);
			_this.relation_options.push({value: data[i].relation, text: data[i].relation});
		}
	})
}