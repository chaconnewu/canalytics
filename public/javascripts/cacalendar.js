function caCalendar(el, options) {
	this.el = el;
	this.el.addClass('cacalendar');
	this.options = $.extend(this.defaultoptions, {
		dayClick: this.showNewEventEditor.bind(this),
		eventClick: this.showEventEditor.bind(this),
		eventMouseover: this.showEvent.bind(this),
		eventMouseout: this.hideEvent
		//select: this.showNewEventSelector.bind(this)
	}, options);
	el.fullCalendar(this.options);
	
	var event_list = this.el.fullCalendar('clientEvents');
	var list = [];
	for(var i=0; i<event_list.length; i++){
		list.push(event_list[i]);
	}	
	for(var i=0; i<list.length; i++){
		if(list[i].repeat){
			this.addRepeatingEvent(list[i]);
		}
	}
};

caCalendar.prototype.metadata = ['title','start','end','repeat','interval','end_after', 'people', 'relationship'];

caCalendar.prototype.interval = ['day','week','month'];

caCalendar.prototype.defaultoptions = {
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'month,agendaWeek,agendaDay'
	},
	allDayDefault: false
};

caCalendar.prototype.showEventEditor = function(calEvent, jsEvent, view){
	var _this = this;
	if(calEvent.className == 'newevent') return false;
	
	var win = $(jsEvent.target).closest('.cacalendar');
	if(win.hasClass('editing')) return false;
	win.addClass('editing');
	
	var el = $(jsEvent.target).closest('.fc-event');
	
	var start = format_date(calEvent.start);
	
	var end = format_date(calEvent.end);
	
	var end_after = calEvent.end_after;
	
	var p_options = '<option></option>';
	var r_options = '<option></option>';
	
	if(calEvent.people) {
		for(var i in capeople.people_list) {
			if(calEvent.people.indexOf(capeople.people_list[i]) > -1) {
				p_options += '<option value="' + capeople.people_list[i] + '" selected>' + capeople.people_list[i] + '</option>';
			} else {
				p_options += '<option value="' + capeople.people_list[i] + '">' + capeople.people_list[i] + '</option>';
			}
		}
		
		for(var i in capeople.relation_list) {
			if(calEvent.relationship == capeople.relation_list[i]) {
				r_options += '<option value="' + capeople.relation_list[i] + '" selected>' + capeople.relation_list[i] + '</option>';
			} else {
				r_options += '<option value="' + capeople.relation_list[i] + '">' + capeople.relation_list[i] + '</option>';
			}
		}
	}
	
	var i_options = '<option></option>';
	
	if(calEvent.interval) {
		for(var i in this.interval) {
			if(calEvent.interval == this.interval[i]) {
				i_options += '<option value="' + this.interval[i] + '" selected>' + this.interval[i] + '</option>';
			} else {
				i_options += '<option value="' + this.interval[i] + '">' + this.interval[i] + '</option>';
			}
		}
	}
	
	var html = "<form id='editevent' name='editevent' action='/calendars/events/" + calEvent.id + "' method='put'><input type='hidden' name='id' value='" + calEvent.id + "'><input type='hidden' name='ca_calendars_id' value='" + win.attr('id') + "'><input type='hidden' name='ca_calendars_ca_cases_id' value='" + window.cid + "'><input type='hidden' name='gid' value='" + window.gid + "'><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>" + calEvent.title + "</textarea><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + start + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + end + "'><br><label for='repeat'>Repeat Every</label><input type='text' name='repeat' value=" + calEvent.repeat + "> <select name='interval'>" + i_options + "</select><br><label for='end_after'>End On Date:</label><input type='datetime-local' name='end_after' value='" + end_after + "'><br><select name='people' data-placeholder='People...' class='chzn-select' multiple tabindex='1'>" + p_options + "</select><br><select name='relationship' data-placeholder='Relation...' class='chzn-select' tabindex='4'>" + r_options + "</select><br><input id='calput' class='form_btn' type='button' value='Done'><input id='caldel' class='form_btn' type='button' value='Delete'><input class='form_btn calcncl' type='button' value='Cancel'></form>";
	
	el.showBalloon({
		id: 'editorballoon',
		contents:html});
	$(".chzn-select").chosen({
		create_option: function(term){
			if(this.default_text == 'People...') {
				capeople.people_list.push(term);
			}
			if(this.default_text == 'Relation...') {
				capeople.relation_list.push(term);
			}
			this.append_option({
				value: term,
				text: term
			})
		},
		persistent_create_option: true,
		allow_single_deselect: true
		});
			
	$("#calput").click(function(){
		_this.validateForm('editevent');
		var params = $("#editevent").serialize();
		$("#editevent").remove();
		//el.hideBalloon();
		el.removeBalloon('editorballoon');
		ajax_request('/calendars/events/'+calEvent.id, 'PUT', params, _this.updateEvent.bind(_this));
		win.removeClass('editing');
	});
	
	$("#caldel").click(function(){
		$("#editevent").remove();
		//el.hideBalloon();
		el.removeBalloon('editorballoon');
		ajax_request('/calendars/events/'+calEvent.id, 'DELETE', null, function(data){
			_this.el.fullCalendar( 'removeEvents', data.id);
			var _data = data;
			_data.el = $(_this.el).attr('id');
			_data.room = window.caseName;
			socket.emit('DBEventDeleted', _data);
			
			if(window.cagraph){
				if(data.r_delete){
					window.cagraph.unload(data.r_delete);
				}
			}
		});
		el.removeBalloon('balloon-'+calEvent.id);
		win.removeClass('editing');
	});
	
	$(".calcncl").click(function(){
		$("#editevent").remove();
		//el.hideBalloon();
		el.removeBalloon('editorballoon');
		win.removeClass('editing');
	});
	
	return false;
};

caCalendar.prototype.showNewEventEditor = function(date, allDay, jsEvent, view) {
	var _this = this;
	var win = $(jsEvent.target).closest('.cacalendar');
	if(win.hasClass('editing')) return false;
	win.addClass('editing');
	
	var d = format_date(date);
	
	var id = generateUUID();
	win.fullCalendar( 'renderEvent', {
		id: id,
		title: 'New Event',
		start: d,
		end: d,
		className: 'newevent',
		index: 0,
		repeating: false
	}, true);
	
	var el = $(jsEvent.target);
	var p_options = '<option></option>';
	var r_options = '<option></option>';

	for(var i in capeople.people_list) {
		p_options = p_options + '<option value="' + capeople.people_list[i] + '">' + capeople.people_list[i] + '</option>';
	}
	for(var i in capeople.relation_list) {
		r_options = r_options + '<option value="' + capeople.relation_list[i] + '">' + capeople.relation_list[i] + '</option>';
	}
	var html = "<form id='newevent' name='newevent'><input type='hidden' name='id' value='" + id + "'><input type='hidden' name='ca_calendars_id' value='" + win.attr('id') + "'><input type='hidden' name='ca_calendars_ca_cases_id' value='" + window.cid + "'><input type='hidden' name='gid' value='" + window.gid + "'><input type='hidden' name='index' value=0><input type='hidden' name='repeating' value=false><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>New Event</textarea><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + d + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + d + "'><br><label for='repeat'>Repeat Every</label><input type='text' name='repeat'> <select name='interval'><option value=''></option><option value='day'>Day(s)</option><option value='week'>Week(s)</option><option value='month'>Month(s)</option></select><br><label for='endond'>End On Date:</label><input type='datetime-local' name='end_after'><br><select name='people' data-placeholder='People...' class='chzn-select' multiple tabindex='1'>" + p_options + "</select><br><select name='relationship' data-placeholder='Relation...' class='chzn-select' tabindex='4'>" + r_options + "</select><br><input id='calpost' class='form_btn' type='button' value='Done'><input class='form_btn calcncl' type='button' value='Cancel'></form>";
	el.showBalloon({
		id: 'neweditorballoon',
		offsetX: jsEvent.clientX-el.offset().left-el.outerWidth()+10,
		contents:html
	});
	$(".chzn-select").chosen({
		create_option: function(term){
			if(this.default_text == 'People...') {
				capeople.people_list.push(term);
			}
			if(this.default_text == 'Relation...') {
				capeople.relation_list.push(term);
			}
			this.append_option({
				value: term,
				text: term
			})
		},
		persistent_create_option: true,
		allow_single_deselect: true
	});
	$("#calpost").click(function(){
		_this.validateForm('newevent');
		var params = $("#newevent").serialize();
		$("#newevent").remove();
		//el.hideBalloon();
		el.removeBalloon('neweditorballoon');
		ajax_request('/calendars/events', 'POST', params, _this.updateEvent.bind(_this));
		win.removeClass('editing');
	});
	$(".calcncl").click(function(){
		$("#newevent").remove();
		//el.hideBalloon();
		el.removeBalloon('neweditorballoon');
		win.fullCalendar( 'removeEvents', id);
		win.removeClass('editing');
	});
	
	return false;
};

caCalendar.prototype.updateEvent = function(data) {
	var _this = this;
	data.className = 'caevent';
	
  var e = this.el.fullCalendar('clientEvents', data.id);
	
	var idx = data.index;
	$.extend(e[idx], data);
	var count = e.length;
	if((e[0].repeat!='')||(data.repeat!='')){
		//process repeating event
		var idx = data.index;
		
		_this.el.fullCalendar( 'updateEvent', e[idx]);
		e.splice(idx+1, count-idx-1);
		_this.addRepeatingEvent(e[idx]);
	}
	
	var _data = data;
	_data.el = $(this.el).attr('id');
	_data.room = window.caseName;
	socket.emit('DBEventUpdated', _data);
	
	if(window.cagraph){
		if(data.r_insert){
			window.cagraph.load(data.r_insert);
		}
		if(data.r_delete){
			window.cagraph.unload(data.r_delete);
		}
	}
};

caCalendar.prototype.showEvent = function(event, jsEvent, view) {
	delete event.foo;
	var win = $(jsEvent.target).closest('.cacalendar');
	if(win.hasClass('editing')) return false;
	
	var el = $(jsEvent.currentTarget);
	
	var _this = this;
	
	var html = "";
	
	Object.keys(event).forEach(function(attr){
		if(_this.metadata.indexOf(attr) > -1 && event[attr]!='undefined' && event[attr]!=null && event[attr]!='' && event[attr]!= 0) {
			switch(attr) {
				case 'start': 
					var d = format_date(event[attr]);
					html += "<span>" + attr + ": " + d + "</span><br/>";
					break;
				case 'end':
					var d = format_date(event[attr]);
					html += "<span>" + attr + ": " + d + "</span><br/>";
					break;
				case 'people':
					if(type(event[attr]) == 'Array') {
						var p = '';
						for(var i=0; i<event[attr].length; i++){
							p += event[attr][i] + ' ';
						}
						html += "<span>" + attr + ": " + p + "</span><br/>";
					} else {
						html += "<span>" + attr + ": " + event[attr] + "</span><br/>";
					}
					break;
				case 'relationship':
					html += "<span>" + attr + ": " + event[attr] + "</span><br/>";
					break;
			}
		}
	})
	
	html += "</div>";
	
	$(el).showBalloon({
		id: 'balloon-'+event.id,
		contents: html
	});
	
	return false;
};

caCalendar.prototype.hideEvent = function(event, jsEvent, view) {
	var win = $(this).closest('.cacalendar');
	if(win.hasClass('editing')) return false;
	
	$(this).hideBalloon({});
	
	return false;
};

caCalendar.prototype.showNewEventSelector = function(startDate, endDate, allDay, jsEvent, view) {
	var _this = this;
	var win = $(jsEvent.target).closest('.cacalendar');
	if(win.hasClass('editing')) return false;
	win.addClass('editing');
	
	var start = format_date(startDate);
	
	var end = new Date(endDate);
	end = end.setHours(end.getHours()+1);
	end = new Date(end);
	end = format_date(end);
	
	var id = generateUUID();
	win.fullCalendar( 'renderEvent', {
		id: id,
		title: 'New Event',
		start: start,
		end: end,
		className: 'newevent'
	}, true);
	
	var el = $(jsEvent.target);
	var html = "<form id='newevent' name='newevent'><input type='hidden' name='id' value='" + id + "'><input type='hidden' name='ca_calendars_id' value='" + win.attr('id') + "'><input type='hidden' name='ca_calendars_ca_cases_id' value='" + window.cid + "'><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>New Event</textarea><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + start + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + end + "'><br><label for='repeat'>Repeat Every</label><input type='text' name='repeat'> <select name='interval'><option value=''></option><option value='day'>Day(s)</option><option value='week'>Week(s)</option><option value='month'>Month(s)</option></select><br><label for='endond'>End On Date:</label><input type='datetime-local' name='end_after'><br><input id='calpost' class='form_btn' type='button' value='Done'><input class='form_btn calcncl' type='button' value='Cancel'></form>";
	el.showBalloon({
		id: 'newselectorballoon',
		offsetX: jsEvent.clientX-el.offset().left-el.outerWidth()+10,
		contents:html
	});
	$("#calpost").click(function(){
		_this.validateForm('newevent');
		var params = $("#newevent").serialize();
		$("#newevent").remove();
		//el.hideBalloon();
		el.removeBalloon('newselectorballoon');
		ajax_request('/calendars/events', 'POST', params, _this.updateEvent.bind(_this));
		win.fullCalendar('unselect');
		win.removeClass('editing');
	});
	$(".calcncl").click(function(){
		$("#newevent").remove();
		//el.hideBalloon();
		el.removeBalloon('newselectorballoon');
		win.fullCalendar( 'removeEvents', id);
		win.fullCalendar('unselect');
		win.removeClass('editing');
	});
	
	return false;
};

caCalendar.prototype.validateForm = function(el){
	var fm = document.forms[el];
	
	//validate time
	var start = document.forms[el]['start'].value;
	var end = document.forms[el]['end'].value || start;
	
	var _start = $.fullCalendar.parseDate(start);
	var _end = $.fullCalendar.parseDate(end);
	
	if(_start.getTime() >= _end.getTime()){
		_end = _end.setHours(_start.getHours()+1);
		_end = new Date(_end);
		fm.elements['end'].value = format_date(_end);
	}
	
	//validate repeating events
	var repeat = fm['repeat'].value;
	var interval = fm['interval'].value;
	var end_after = fm['end_after'].value;
	var _end_after = $.fullCalendar.parseDate(end_after);
	
	if(repeat&&repeat!=''&&interval&&interval!=''&&end_after&&end_after!=''&&_end_after){
		//check whether end_after is after the end time, if not, make it valid
		if(_end_after.getTime() < _end.getTime()){
			_end_after = new Date(_end);
			fm['end_after'].value = format_date(_end_after);
		}
		//else it's valid
		fm['repeating'].value = true;
	} else {
		//invalid repeating events
		fm['repeat'].value = '';
		fm['interval'].value = '';
		fm['end_after'].value = '';
	}
	
	//validate relationship
	var relationship = fm['relationship'].value;
	var people = fm['people'];
	var count = 0;
	for(var i=0; i<people.length; i++){
		if(people[i].selected) count++;
	}
	if(relationship&&relationship!=''){
		//check whether there are at least two people in people field
		if(count<2){
				fm['relationship'].value = '';
				fm['people'].value = '';
		}
	} else {
		//invalid values, delete relationship and people
		fm['relationship'] = '';
		fm['people'] = '';
	}
};

caCalendar.prototype.validateEvent = function(calEvent){
	//validate relationship and people
	if(type(calEvent.people) == 'Array' && calEvent.relationship && calEvent.relationship!='') {
		//it's valid
	} else {
		if(calEvent.people) delete calEvent.people;
		if(calEvent.relationship) delete calEvent.relationship;
	}
	return calEvent;
};

caCalendar.prototype.addRepeatingEvent = function(calEvent){
	var _this = this;
			var count = 0;
			var repeat = parseInt(calEvent.repeat);
			var interval = calEvent.interval;
			var end_after = new Date(calEvent.end_after);
			var start = new Date(calEvent.start);
			var end_after_s = end_after.getTime();
			var start_s = start.getTime();
			var interval_s = 0;
			switch(interval){
				case 'day':
					interval_s = 86400000;
					break;
				case 'week':
					interval_s = 604800000;
					break;
				case 'month':
					interval_s = 2592000000;
					break;
			}
			
			count = Math.floor((end_after_s - start_s)/(repeat*interval_s));
	
			for(var j=1; j<count; j++){
					_this.el.fullCalendar( 'renderEvent', {
					id: calEvent.id,
					title: calEvent.title,
					start: format_date(new Date(calEvent.start.getTime()+j*interval_s)),
					end: format_date(new Date(calEvent.end.getTime()+j*interval_s)),
					allDay: calEvent.allDay,
					className: 'caevent',
					repeat: calEvent.repeat,
					interval: calEvent.interval,
					end_after: calEvent.end_after,
					people: calEvent.people,
					relationship: calEvent.relationship,
					index: j
				}, true);
			}
};

function ajax_request(url, method, data, success) {
	data = data||{};
	success = success||function(){};
	$.ajax({
  	url: url,
  	type: method,
  	data: data,
  	success: success
	});
};

function format_date(date) {
	date = $.fullCalendar.formatDate(date, 'yyyy-MM-ddXHH:mm:ss');
	date = date.replace('X', 'T');
	
	return date;
};

function format_data(data) {
	Object.keys(data).forEach(function(attr){
		var a = type(data[attr]);
		if(a!='String' && a!='Number') {
			delete data[attr];
		}
	});
	
	return data;
};

function type(obj){
    return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]
};

