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
};

caCalendar.prototype.metadata = ['title','start','end', 'location', 'people', 'relationship'];

caCalendar.prototype.rinterval = ['day(s)','week(s)','month(s)'];

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
	var l_options = '<option></option>';
	var people_list = [];
	
	if(calEvent.people) people_list = calEvent.people.split(',');
	
	for(var i in capeople.people_list) {
		if(people_list.indexOf(capeople.people_list[i]) > -1) {
			p_options += '<option value="' + capeople.people_list[i] + '" selected>' + capeople.people_list[i] + '</option>';
		} else {
			p_options += '<option value="' + capeople.people_list[i] + '">' + capeople.people_list[i] + '</option>';
		}
	}
	
	for(var i in capeople.relation_list) {
		if(capeople.relation_list[i] === calEvent.relationship) {
			r_options += '<option value="' + capeople.relation_list[i] + '" selected>' + capeople.relation_list[i] + '</option>';
		} else {
			r_options += '<option value="' + capeople.relation_list[i] + '">' + capeople.relation_list[i] + '</option>';
		}
	}
	
	var i_options = '<option></option>';
	
		for(var i in this.rinterval) {
			if(calEvent.rinterval == this.rinterval[i]) {
				i_options += '<option value="' + this.rinterval[i] + '" selected>' + this.rinterval[i] + '</option>';
			} else {
				i_options += '<option value="' + this.rinterval[i] + '">' + this.rinterval[i] + '</option>';
			}
		}
	
	calEvent.rrepeat = (calEvent.rrepeat==0)?'':calEvent.rrepeat
	
		for(var i in calocation.location_list) {
			if(calocation.location_list[i] === calEvent.location) {
				l_options += '<option value="' + calocation.location_list[i] + '" selected>' + calocation.location_list[i] + '</option>';
			} else {
				l_options += '<option value="' + calocation.location_list[i] + '">' + calocation.location_list[i] + '</option>';
			}
		}
	
	var html = "<form id='editevent' name='editevent' action='/calendars/events/" + calEvent.id + "' method='put'><input type='hidden' name='id' value='" + calEvent.id + "'><input type='hidden' name='ca_calendars_id' value='" + win.attr('id') + "'><input type='hidden' name='ca_calendars_ca_cases_id' value='" + window.cid + "'><input type='hidden' name='gid' value='" + window.gid + "'><input type='hidden' name='rindex' value=" + calEvent.rindex + "><input type='hidden' name='repeating' value=" + calEvent.repeating + "><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>" + calEvent.title + "</textarea><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + start + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + end + "'><br><label for='rrepeat'>Repeat Every</label><input type='text' name='rrepeat' value=" + calEvent.rrepeat + "> <select name='rinterval'>" + i_options + "</select><br><label for='end_after'>End On Date:</label><input type='datetime-local' name='end_after' value='" + end_after + "'><br><select name='location' data-placeholder='Location...' class='chzn-select' tabindex='4'>" + l_options + "</select><br><select name='people' data-placeholder='People...' class='chzn-select' multiple tabindex='1'>" + p_options + "</select><br><select name='relationship' data-placeholder='Relation...' class='chzn-select' tabindex='4'>" + r_options + "</select><br><input id='calput' class='form_btn' type='button' value='Done'><input id='caldel' class='form_btn' type='button' value='Delete'><input class='form_btn calcncl' type='button' value='Cancel'></form>";
	
	el.showBalloon({
		id: 'editorballoon',
		contents:html});
	$(".chzn-select").chosen({
		create_option: function(term){
			var that = this;
			if(this.default_text == 'People...') {
				capeople.people_list.push(term);
				this.append_option({
					value: term,
					text: term
				})
			}
			if(this.default_text == 'Relation...') {
				capeople.relation_list.push(term);
				this.append_option({
					value: term,
					text: term
				})
			}
			if(this.default_text == 'Location...') {
				_this.searchLocations(term, 'editorballoon', function(loc_selected){
					if(loc_selected){
						calocation.location_list.push(loc_selected);
						that.append_option({
							value: loc_selected,
							text: loc_selected
						})
					}
				});
			}
		},
		persistent_create_option: true,
		allow_single_deselect: true
		});
			
	$("#calput").click(function(){
		_this.validateForm('editevent');
		var params = $("#editevent").serialize();
		if(calEvent.repeating){
			$("#editorballoon").append("<div id='repeating_alert'><b>You're changing a repeating event.</b><br>Do you want to change only this occurrence of the event, or this and all future occurrences?</div>");
			
			$("#repeating_alert").dialog({
				width: 'auto',
				modal: true,
				buttons:{
					'Cancel': function(){
						$(this).dialog("close");
						$("#editevent").remove();
						el.removeBalloon('editorballoon');
						win.removeClass('editing');
					},
					'All Future Events': function(){
						$(this).dialog("close");
						$("#editevent").remove();
						el.removeBalloon('editorballoon');
						params += "&idx=x"+calEvent.rindex;
						ajax_request('/calendars/events/'+calEvent.id, 'PUT', params, _this.updateEvent.bind(_this));
						win.removeClass('editing');
					},
					'Only This Event': function(){
						$(this).dialog("close");
						$("#editevent").remove();
						el.removeBalloon('editorballoon');
						params += "&idx="+calEvent.rindex;
						ajax_request('/calendars/events/'+calEvent.id, 'PUT', params, _this.updateEvent.bind(_this));
						win.removeClass('editing');
					}
				},
				close: function(ev, ui) {
					$(this).dialog("destroy");
					$(this).remove();
				}
			})
		} else {
			$("#editevent").remove();
			el.removeBalloon('editorballoon');
			ajax_request('/calendars/events/'+calEvent.id, 'PUT', params, _this.updateEvent.bind(_this));
			win.removeClass('editing');
		}
	});
	
	$("#caldel").click(function(){
		if(calEvent.repeating){
			$("#editorballoon").append("<div id='repeating_alert'><b>You're deleting a repeating event.</b><br>Do you want to delete only the selected occurrence, or this and all future occurrences of this event?</div>");
			
			$("#repeating_alert").dialog({
				width: 'auto',
				modal: true,
				buttons:{
					'Cancel': function(){
						$(this).dialog("close");
						$("#editevent").remove();
						el.removeBalloon('editorballoon');
						win.removeClass('editing');
					},
					'Delete All Future Events': function(){
						$(this).dialog("close");
						$("#editevent").remove();
						el.removeBalloon('editorballoon');
						var params = "idx=x"+calEvent.rindex+"&rindex="+calEvent.rindex;
						ajax_request('/calendars/events/'+calEvent.id, 'DELETE', params, function(data){
							var e = _this.el.fullCalendar( 'clientEvents', data.id);

							var count = e[e.length-1].rindex;
							var id = calEvent.id;
							var idx = calEvent.rindex;
							
							/*for(var i=idx;i<count;i++){
								$('#balloon-'+calEvent.id+'-'+i).remove();
							}*/
							
							_this.el.fullCalendar( 'removeEvents', function(eventObject){
								return (eventObject.id == id) && (eventObject.rindex >= idx);
							});

							var _data = data;
							_data.el = $(_this.el).attr('id');
							_data.room = window.caseName;
							_data.idx = idx;
							_data.mode = 'da';
							socket.emit('DBEventDeleted', _data);

							if(window.cagraph){
								if(data.r_delete){
									window.cagraph.unload(data.r_delete);
								}
							}
						});
						win.removeClass('editing');
					},
					'Delete Only This Event': function(){
						$(this).dialog("close");
						$("#editevent").remove();
						el.removeBalloon('editorballoon');
						var params = "idx="+calEvent.rindex+"&rindex="+calEvent.rindex;
						ajax_request('/calendars/events/'+calEvent.id, 'DELETE', params, function(data){
							var id = calEvent.id;
							var idx = calEvent.rindex;
							
							//el.removeBalloon('balloon-'+calEvent.id+'-'+idx);
							
							_this.el.fullCalendar( 'removeEvents', function(eventObject){
								return (eventObject.id == id) && (eventObject.rindex == idx)
							});
							
							var _data = data;
							_data.el = $(_this.el).attr('id');
							_data.room = window.caseName;
							_data.idx = idx;
							_data.mode = 'do';
							socket.emit('DBEventDeleted', _data);

							if(window.cagraph){
								if(data.r_delete){
									window.cagraph.unload(data.r_delete);
								}
							}
						});
						win.removeClass('editing');
					}
				},
				close: function(ev, ui) {
					$(this).dialog("destroy");
					$(this).remove();
				}
			})
		} else {
			$("#editevent").remove();
			//el.hideBalloon();
			el.removeBalloon('editorballoon');
			ajax_request('/calendars/events/'+calEvent.id, 'DELETE', null, function(data){
				_this.el.fullCalendar( 'removeEvents', data.id);
				
				//el.removeBalloon('balloon-'+calEvent.id+'-'+calEvent.rindex);
				win.removeClass('editing');
				
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
		}
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
		rindex: 0,
		repeating: 0
	}, true);
	
	var el = $(jsEvent.target);
	var p_options = '<option></option>';
	var r_options = '<option></option>';
	var l_options = '<option></option>';

	for(var i in capeople.people_list) {
		p_options = p_options + '<option value="' + capeople.people_list[i] + '">' + capeople.people_list[i] + '</option>';
	}
	for(var i in capeople.relation_list) {
		r_options = r_options + '<option value="' + capeople.relation_list[i] + '">' + capeople.relation_list[i] + '</option>';
	}
	for(var i in calocation.location_list) {
		l_options = l_options + '<option value="' + calocation.location_list[i] + '">' + calocation.location_list[i] + '</option>';
	}
	
	var html = "<form id='newevent' name='newevent'><input type='hidden' name='id' value='" + id + "'><input type='hidden' name='ca_calendars_id' value='" + win.attr('id') + "'><input type='hidden' name='ca_calendars_ca_cases_id' value='" + window.cid + "'><input type='hidden' name='gid' value='" + window.gid + "'><input type='hidden' name='rindex' value=0><input type='hidden' name='repeating' value=0><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>New Event</textarea><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + d + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + d + "'><br><label for='rrepeat'>Repeat Every</label><input type='text' name='rrepeat'> <select name='rinterval'><option value=''></option><option value='day(s)'>Day(s)</option><option value='week(s)'>Week(s)</option><option value='month(s)'>Month(s)</option></select><br><label for='end_after'>End On Date:</label><input type='datetime-local' name='end_after'><br><select name='location' data-placeholder='Location...' class='chzn-select' tabindex='4'>" + l_options + "</select><br><select name='people' data-placeholder='People...' class='chzn-select' multiple tabindex='1'>" + p_options + "</select><br><select name='relationship' data-placeholder='Relation...' class='chzn-select' tabindex='4'>" + r_options + "</select><br><input id='calpost' class='form_btn' type='button' value='Done'><input class='form_btn calcncl' type='button' value='Cancel'></form>";
	el.showBalloon({
		id: 'neweditorballoon',
		offsetX: jsEvent.clientX-el.offset().left-el.outerWidth()+10,
		contents:html
	});
	$(".chzn-select").chosen({
		create_option: function(term){
			var that = this;
			if(this.default_text == 'People...') {
				capeople.people_list.push(term);
				this.append_option({
					value: term,
					text: term
				})
			}
			if(this.default_text == 'Relation...') {
				capeople.relation_list.push(term);
				this.append_option({
					value: term,
					text: term
				})
			}
			if(this.default_text == 'Location...') {
				_this.searchLocations(term, 'neweditorballoon', function(loc_selected){
					if(loc_selected){
						calocation.location_list.push(loc_selected);
						that.append_option({
							value: loc_selected,
							text: loc_selected
						})
					}
				});
			}
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
	var results = data.results;
	
  var e = this.el.fullCalendar('clientEvents', results[0].id);
	
	if(e.length < results.length){
		_this.el.fullCalendar('removeEvents', results[0].id);
		for(var i=0; i<results.length; i++){
			$.extend(results[i], { className: 'caevent' });
			_this.el.fullCalendar( 'renderEvent', results[i]);
		}
	} else {
		for(var i=0; i<results.length; i++){
				$.extend(e[i], results[i], { className: 'caevent' });
			  _this.el.fullCalendar( 'updateEvent', e[i]);
		}
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
				default:
					html += "<span>" + attr + ": " + event[attr] + "</span><br/>";
					break;
			}
		}
	})
	
	html += "</div>";
	
		$(el).showBalloon({
			id: 'balloon-'+event.id+'-'+event.rindex,
			contents: html
		});
	
	
	return false;
};

caCalendar.prototype.hideEvent = function(event, jsEvent, view) {
	var win = $(this).closest('.cacalendar');
	if(win.hasClass('editing')) return false;
	
	$(this).removeBalloon('balloon-'+event.id+'-'+event.rindex);
	
	return false;
};

caCalendar.prototype.validateForm = function(el){
	var fm = document.forms[el];
	
	//validate time
	var start = fm['start'].value;
	var end = fm['end'].value || start;
	
	var _start = $.fullCalendar.parseDate(start);
	var _end = $.fullCalendar.parseDate(end);
	
	if(_start.getTime() >= _end.getTime()){
		_end = _end.setHours(_start.getHours()+1);
		_end = new Date(_end);
		fm.elements['end'].value = format_date(_end);
	}
	
	//validate repeating events
	var repeat = fm['rrepeat'].value;
	var interval = fm['rinterval'].value;
	var end_after = fm['end_after'].value;
	var _end_after = $.fullCalendar.parseDate(end_after);
	
	if(repeat&&repeat!=''&&interval&&interval!=''&&end_after&&end_after!=''&&_end_after){
		//check whether end_after is after the end time, if not, make it valid
		if(_end_after.getTime() < _end.getTime()){
			_end_after = new Date(_end);
			fm['end_after'].value = format_date(_end_after);
		}
		//else it's valid
		fm['repeating'].value = 1;
	} else {
		//invalid repeating events
		fm['rrepeat'].value = '';
		fm['rinterval'].value = '';
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

caCalendar.prototype.searchLocations = function(loc, el, callback){
		if(calocation.location_list.indexOf(loc) > -1) {
			callback(null);
		} else {
		geocoder.geocode({
			'address': loc
		}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK) {
				//valid location
				var radio_btns = '';
				var addrs = {};
				for(var i=0; i<results.length; i++){
					radio_btns += "<input type='radio' name='loc' value='" + results[i]["formatted_address"] + "'>" + results[i]["formatted_address"] + "<br>";
					addrs[results[i]["formatted_address"]] = results[i]["geometry"]["location"];
				}
				$("#"+el).append("<div id='location_alert'><form id='locform' name='locform'><b>Which location do you mean?</b><br>" + radio_btns + "</form></div>");

				$("#location_alert").dialog({
					width: 'auto',
					modal: true,
					buttons:{
						'None of the above': function(){
							$(this).dialog("close");
							callback(null);
						},
						'Done': function(){
							var loc_selected = $('input:radio[name=loc]:checked').val();
							$(this).dialog("close");
							if(camap){
							new google.maps.Marker({
								map: camap.map,
								position: addrs[loc_selected],
								title: loc_selected
							})}
							var params = "location="+encodeURIComponent(loc_selected)+"&lat="+addrs[loc_selected].lat()+"&lng="+addrs[loc_selected].lng()+"&mid="+mid;
							ajax_request('/maps/location', 'POST', params, callback(loc_selected));
						}
					},
					close: function(ev, ui) {
						$(this).dialog("destroy");
						$(this).remove();
					}
				})
			} else {
				$("#"+el).append("<div id='location_alert'>We could not find the location <b>" + loc + "</b>. Make sure all street and city names are spelled correctly.</div>");
				callback(null);
			}
		})
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


function ajax_request(url, method, data, success) {
	data = data||{};
	success = success||function(){};
	$.ajax({
  	url: url,
  	type: method,
		async: false,
  	data: data,
  	success: success,
		error: function(){
			console.log($.makeArray(arguments));
		}
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

