function caCalendar(el, options) {
	this.el = el;
	this.el.addClass('cacalendar');
	this.dropdowncontrol = {};
	this.options = $.extend(this.defaultoptions, {
		dayClick: this.showNewEventEditor.bind(this),
		eventClick: this.showEventEditor.bind(this),
		eventMouseover: this.showEvent.bind(this),
		eventMouseout: this.hideEvent
		//select: this.showNewEventSelector.bind(this)
	}, options);
	this.newEventEditor = null;
	this.editingEventEditor = null;

	this.setupNewEventEditor();
	this.setupEventEditor();
	this.setupDropDownList();

	el.fullCalendar(this.options);
};

caCalendar.prototype.reload = function(data){
	this.options.events = data;
	this.el.fullCalendar(this.options);
};

caCalendar.prototype.metadata = ['title', 'start', 'end', 'ca_location_location', 'people', 'relation'];

caCalendar.prototype.rinterval = ['day(s)', 'week(s)', 'month(s)'];

caCalendar.prototype.defaultoptions = {
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'month,agendaWeek,agendaDay'
	},
	allDayDefault: false
};

caCalendar.prototype.setupDropDownList = function() {
	var _this = this;
	
	var l_options = []
	var p_options = [];
	var r_options = [];

	for (var i in calocation.location_list) {
		l_options.push({value: calocation.location_list[i], text: calocation.location_list[i]})
	}

	for (var i in capeople.people_list) {
		p_options.push({value: capeople.people_list[i], text: capeople.people_list[i]})
	}

	for (var i in capeople.relation_list) {
		r_options.push({value: capeople.relation_list[i], text: capeople.relation_list[i]})
	}
	
	this.dropdowncontrol.selectlocation1 = $("#selectlocation1").selectize({
		hideSelected: true,
		options: l_options,
		create: function(input) {
			_this.searchLocations(input, 'neweventeditor', function(loc_selected) {
				if (loc_selected) {
					calocation.location_list.push(loc_selected);
					return {
						value: input,
						text: input
					}
				}
				
				return null;
			})
		}});
	this.dropdowncontrol.selectlocation2 = $("#selectlocation2").selectize({
		hideSelected: true,
		options: l_options,
		create: function(input) {
			_this.searchLocations(input, 'neweventeditor', function(loc_selected) {
				if (loc_selected) {
					calocation.location_list.push(loc_selected);
					return {
						value: input,
						text: input
					}
				}
				return null;
			})
		}});
	this.dropdowncontrol.selectpeople1 = $("#selectpeople1").selectize({
		hideSelected: true,
		options: p_options,
		create: function(input) {
			capeople.people_list.push(input);
			return {
				value: input,
				text: input
			}
		}
	});
	this.dropdowncontrol.selectpeople2 = $("#selectpeople2").selectize({
		hideSelected: true,
		options: p_options,
		create: function(input) {
			capeople.people_list.push(input);
			return {
				value: input,
				text: input
			}
		}
	});
	this.dropdowncontrol.selectrelation1 = $("#selectrelation1").selectize({
		hideSelected: true,
		options: r_options,
		create: function(input) {
			capeople.relation_list.push(input);
			return {
				value: input,
				text: input
			}
		}
	});
	this.dropdowncontrol.selectrelation2 = $("#selectrelation2").selectize({
		hideSelected: true,
		options: r_options,
		create: function(input) {
			capeople.relation_list.push(input);
			return {
				value: input,
				text: input
			}
		}
	});
	this.dropdowncontrol.selectinterval1 = $("#selectinterval1").selectize();
	this.dropdowncontrol.selectinterval2 = $("#selectinterval2").selectize();
};

caCalendar.prototype.setupNewEventEditor = function() {
	var _this = this;
	var win = this.el;
	
	var d = new Date();
	
	var html = "<form id='newevent' name='newevent'><input type='hidden' name='ca_case_id' value='" + window.ca_case_id + "'><input type='hidden' name='rindex' value=0><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>New Event</textarea><br><select id='selectlocation1' placeholder='Location' name='location' tabindex='6'></select><br><select id='selectpeople1' multiple placeholder='People' name='people' tabindex='6'></select><br><select id='selectrelation1' placeholder='Relation' name='relation' tabindex='6'></select><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + d + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + d + "'><br><label for='rrepeat'>Repeat Every</label><input type='text' name='rrepeat'> <select id='selectinterval1' name='rinterval'><option value=''></option><option value='day(s)'>Day(s)</option><option value='week(s)'>Week(s)</option><option value='month(s)'>Month(s)</option></select><br><label for='end_after'>End On Date:</label><input type='datetime-local' name='end_after'><br><input id='calpost' class='form_btn' type='button' value='Done'><input class='form_btn calcncl' type='button' value='Cancel'></form>";

	var div = $('<div id="neweventeditor" class="eventeditor"></div>').appendTo($('body'));
	div.addClass('eventeditor-hidden');

	var neweventform = $(html).appendTo(div);
	neweventform.prepend("<div id='err1'></div>")
	$("#calpost").click(function() {
		var err = _this.validateForm1('newevent');
		if (err) {
			$("#err1").html(err);
		} else {
			var params = $("#newevent").serialize();
			div.addClass('eventeditor-hidden');
			neweventform[0].reset();
			win.removeClass('editing');
			ajax_request('/calendars/events', 'POST', params, _this.updateEvent.bind(_this));
		}
	});
	$(".calcncl").click(function() {
		div.addClass('eventeditor-hidden');
		neweventform[0].reset();
		win.removeClass('editing');
	});

	win.click(function(e){
		e.stopPropagation();
	});
	div.click(function(e){
		e.stopPropagation();
	});
	$(document).click(function(){
		div.addClass('eventeditor-hidden');
		neweventform[0].reset();
		win.removeClass('editing');
	})
	this.newEventEditor = div;
};

caCalendar.prototype.setupEventEditor = function() {
	var _this = this;
	var win = this.el;
	
	var html = "<form id='editingevent' name='editingevent'><input type='hidden' name='ca_case_id' value='" + window.ca_case_id + "'><input type='hidden' name='rindex' value=0><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>New Event</textarea><br><select id='selectlocation2' placeholder='Location' name='location' tabindex='6'></select><br><select id='selectpeople2' multiple placeholder='People' name='people' tabindex='6'></select><br><select id='selectrelation2' placeholder='Relation' name='relation' tabindex='6'></select><br><label for='start'>From:</label><input type='datetime-local' name='start'><br><label for='end'>To:</label><input type='datetime-local' name='end'><br><label for='rrepeat'>Repeat Every</label><input type='text' name='rrepeat'> <select id='selectinterval2' name='rinterval'><option value=''></option><option value='day(s)'>Day(s)</option><option value='week(s)'>Week(s)</option><option value='month(s)'>Month(s)</option></select><br><label for='end_after'>End On Date:</label><input type='datetime-local' name='end_after'><br><input id='calput' class='form_btn' type='button' value='Done'><input class='form_btn calcncl' type='button' value='Cancel'><input id='caldel' class='form_btn' type='button' value='Delete'><br><div id='event_status'><div></form>";

	var div = $('<div id="editingeventeditor" class="eventeditor"></div>').appendTo($('body'));
	div.addClass('eventeditor-hidden');
	var editingeventform = $(html).appendTo(div);
	editingeventform.prepend("<div id='err2'></div>");
	
	win.click(function(e){
		e.stopPropagation();
	});
	div.click(function(e){
		e.stopPropagation();
	});
	$(document).click(function(){
		div.addClass('eventeditor-hidden');
		editingeventform[0].reset();
		win.removeClass('editing');
		$('#event_status').load('/desync', function() {
			$('#editingevent :input').prop('disabled', false);
		});
	})
	
	this.editingEventEditor = div;
};

caCalendar.prototype.showEventEditor = function(calEvent, jsEvent, view) {
	var _this = this;

	var win = this.el;

	if (calEvent.ca_annotation_id) return false;
	if (win.hasClass('editing')) return false;
	$('#event_status').load('/sync', {
		id: 'event_' + calEvent.id
	}, function(data) {
		if (data.indexOf('please try again') !== -1) {
			$('#editingevent :input').prop('disabled', true);

			win.addClass('editing');

			_this.hideEvent(calEvent, jsEvent, view);

			_this.editingEventEditor.removeClass('eventeditor-hidden');
			_this.editingEventEditor.offset({
				top: jsEvent.pageY,
				left: jsEvent.pageX
			});
			_this.editingEventEditor.css('z-index', 99999);

			$(".calcncl").prop('disabled', false);
			$(".calcncl").click(function() {
				div.addClass('eventeditor-hidden');
				editingeventform[0].reset();
				win.removeClass('editing');
				$('#event_status').load('/desync', function() {
					$('#editingevent :input').prop('disabled', false);
					return false;
				});
			});
		}
	});
	win.addClass('editing');

	this.hideEvent(calEvent, jsEvent, view);

	var el = $(jsEvent.target).closest('.fc-event');

	var div = $('#editingeventeditor');

	var editingeventform = $('#editingevent');

	var start = format_date(calEvent.start);

	var end = format_date(calEvent.end);

	var end_after = calEvent.end_after;

	this.editingEventEditor.removeClass('eventeditor-hidden');
	this.editingEventEditor.offset({
		top: jsEvent.pageY,
		left: jsEvent.pageX
	});
	this.editingEventEditor.css('z-index', 99999);

	$('<input>').attr({
		type: 'hidden',
		name: 'id'
	}).appendTo('#editingevent');

	this.dropdowncontrol.selectpeople2[0].selectize.clear();
	var people_list = [];
	if (calEvent.people) people_list = calEvent.people.split(',');
	for (var i in people_list){
		this.dropdowncontrol.selectpeople2[0].selectize.addItem(people_list[i])	
	}
	
	this.dropdowncontrol.selectrelation2[0].selectize.clear();
	this.dropdowncontrol.selectrelation2[0].selectize.addItem(calEvent.relation);
	
	this.dropdowncontrol.selectlocation2[0].selectize.clear();
	this.dropdowncontrol.selectlocation2[0].selectize.addItem(calEvent.ca_location_location);
	
	this.dropdowncontrol.selectinterval2[0].selectize.clear();
	this.dropdowncontrol.selectinterval2[0].selectize.addItem(calEvent.rinterval);
	
	$('#editingevent textarea[name=title]').val(calEvent.title);
	$('#editingevent input[name=rrepeat]').val(calEvent.rrepeat);
	$('#editingevent input[name=start]').val(start);
	$('#editingevent input[name=end]').val(end);
	$('#editingevent input[name=end_after]').val(end_after);
	$("#err2").html('');
	
	$("#calput").click(function() {
		var err = _this.validateForm2('editingevent');
		if (err) {
			$("#err2").html(err);
		} else {
			var params = $("#editingevent").serialize();
			if (calEvent.rrepeat) {
				$("#editingeventeditor").append("<div id='repeating_alert'><b>You're changing a repeating event.</b><br>Do you want to change only this occurrence of the event, or this and all future occurrences?</div>");

				$("#repeating_alert").dialog({
					width: 'auto',
					modal: true,
					buttons: {
						'Cancel': function() {
							$(this).dialog("close");
							div.addClass('eventeditor-hidden');
							editingeventform[0].reset();
							win.removeClass('editing');
							$('#event_status').load('/desync', function() {
								$('#editingevent :input').prop('disabled', false);
							});
						},
						'All Future Events': function() {
							$(this).dialog("close");
							params += "&idx=x" + calEvent.rindex;
							div.addClass('eventeditor-hidden');
							editingeventform[0].reset();
							win.removeClass('editing');
							ajax_request('/calendars/events/' + calEvent.id, 'PUT', params, function(data) {
								$('#event_status').load('/desync', function() {
									$('#editingevent :input').prop('disabled', false);
									_this.updateEvent(data);
								});
							});
						},
						'Only This Event': function() {
							$(this).dialog("close");
							params += "&idx=" + calEvent.rindex;
							div.addClass('eventeditor-hidden');
							editingeventform[0].reset();
							win.removeClass('editing');
							ajax_request('/calendars/events/' + calEvent.id, 'PUT', params, function(data) {
								var d = data;
								$('#event_status').load('/desync', function() {
									$('#editingevent :input').prop('disabled', false);
									_this.updateEvent(data);
								});
							});
						}
					},
					close: function(ev, ui) {
						$(this).dialog("destroy");
						$(this).remove();
					}
				})
			} else {
				div.addClass('eventeditor-hidden');
				editingeventform[0].reset();
				win.removeClass('editing');
				ajax_request('/calendars/events/' + calEvent.id, 'PUT', params, function(data) {
					$('#event_status').load('/desync', function() {
						$('#editingevent :input').prop('disabled', false);
						_this.updateEvent(data);
					});
				});
			}
		}
	});

	$("#caldel").click(function() {
		if (calEvent.rrepeat) {
			$("#editingeventeditor").append("<div id='repeating_alert'><b>You're deleting a repeating event.</b><br>Do you want to delete only the selected occurrence, or this and all future occurrences of this event?</div>");

			$("#repeating_alert").dialog({
				width: 'auto',
				modal: true,
				buttons: {
					'Cancel': function() {
						$(this).dialog("close");
						div.addClass('eventeditor-hidden');
						editingeventform[0].reset();
						win.removeClass('editing');
						$('#event_status').load('/desync', function() {
							$('#editingevent :input').prop('disabled', false);
						});
					},
					'Delete All Future Events': function() {
						$(this).dialog("close");
						div.addClass('eventeditor-hidden');
						editingeventform[0].reset();
						win.removeClass('editing');
						var params = "idx=x" + calEvent.rindex + "&rindex=" + calEvent.rindex;
						ajax_request('/calendars/events/' + calEvent.id, 'DELETE', params, function(data) {
							$('#event_status').load('/desync', function() {
								$('#editingevent :input').prop('disabled', false);
								_this.updateEvent(data);
							});
						});
					},
					'Delete Only This Event': function() {
						$(this).dialog("close");
						div.addClass('eventeditor-hidden');
						editingeventform[0].reset();
						win.removeClass('editing');
						var params = "idx=" + calEvent.rindex + "&rindex=" + calEvent.rindex;
						ajax_request('/calendars/events/' + calEvent.id, 'DELETE', params, function(data) {
							$('#event_status').load('/desync', function() {
								$('#editingevent :input').prop('disabled', false);
								_this.updateEvent(data);
							});
						});
					}
				},
				close: function(ev, ui) {
					$(this).dialog("destroy");
					$(this).remove();
				}
			})
		} else {
			div.addClass('eventeditor-hidden');
			editingeventform[0].reset();
			win.removeClass('editing');
			ajax_request('/calendars/events/' + calEvent.id, 'DELETE', params, function(data) {
				$('#event_status').load('/desync', function() {
					$('#editingevent :input').prop('disabled', false);
					_this.updateEvent(data);
				});
			});
		}
	});

	$(".calcncl").click(function() {
		div.addClass('eventeditor-hidden');
		editingeventform[0].reset();
		win.removeClass('editing');
		$('#event_status').load('/desync', function() {
			$('#editingevent :input').prop('disabled', false);
		});
	});

	return false;
};

caCalendar.prototype.showNewEventEditor = function(date, allDay, jsEvent, view) {
	var _this = this;
	var win = this.el;
	if (win.hasClass('editing')) return false;
	win.addClass('editing');
	var d = format_date(date);

	var el = $(jsEvent.target);

	this.newEventEditor.removeClass('eventeditor-hidden');
	var x = this.newEventEditor.offset();
	var y = jsEvent.clientX;
	this.newEventEditor.offset({
		top: jsEvent.pageY,
		left: jsEvent.pageX
	});
	this.newEventEditor.css('z-index', 99999);
	var z = this.newEventEditor.offset();
	$('#newevent input[name=start]').val(d);
	$('#newevent input[name=end]').val(d);
	$("#err1").html('');
	
	this.dropdowncontrol.selectpeople1[0].selectize.clear();
	this.dropdowncontrol.selectrelation1[0].selectize.clear();
	this.dropdowncontrol.selectlocation1[0].selectize.clear();
	this.dropdowncontrol.selectinterval1[0].selectize.clear();

	return false;
};

caCalendar.prototype.updateEvent = function(data) {
	var _this = this;
	var results = data.eventlist;

	var e = this.el.fullCalendar('clientEvents', data.id);

	if (e.length != results.length) {
		_this.el.fullCalendar('removeEvents', results[0].id);
		for (var i = 0; i < results.length; i++) {
			_this.el.fullCalendar('renderEvent', results[i]);
		}
	} else {
		for (var i = 0; i < results.length; i++) {
			$.extend(e[i], results[i]);
			_this.el.fullCalendar('updateEvent', e[i]);
		}
	}

	var _data = data;
	_data.el = $(this.el).attr('id');
	_data.room = window.ct;
	socket.emit('DBEventUpdated', _data);

	for (var i in data.msg) {
		socket.emit(data.msg[i].operation + data.msg[i].resource, {
			room: window.ct,
			id: data.msg[i].id
		})
	}
};

caCalendar.prototype.showEvent = function(event, jsEvent, view) {
	var win = this.el;
	if (win.hasClass('editing')) return false;

	var el = $(jsEvent.currentTarget);

	var _this = this;

	var html = "";

	Object.keys(event).forEach(function(attr) {
		if (_this.metadata.indexOf(attr) > -1 && event[attr] != 'undefined' && event[attr] != null && event[attr] != '' && event[attr] != 0) {
			switch (attr) {
			case 'start':
				var d = format_date(event[attr]);
				html += "<span>" + attr + ": " + d + "</span><br/>";
				break;
			case 'end':
				var d = format_date(event[attr]);
				html += "<span>" + attr + ": " + d + "</span><br/>";
				break;
			case 'people':
				if (type(event[attr]) == 'Array') {
					var p = '';
					for (var i = 0; i < event[attr].length; i++) {
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
		id: 'balloon-' + event.id + '-' + event.rindex,
		contents: html
	});


	return false;
};

caCalendar.prototype.hideEvent = function(event, jsEvent, view) {
	$(this).removeBalloon('balloon-' + event.id + '-' + event.rindex);

	return false;
};

caCalendar.prototype.validateForm1 = function(el) {
	var fm = document.forms[el];
	var err = '';

	//validate time
	var start = fm['start'].value;
	var end = fm['end'].value || start;

	if (start) {
		var _start = $.fullCalendar.parseDate(start);
		var _end = $.fullCalendar.parseDate(end);

		if (_start.getTime() >= _end.getTime()) {
			_end = _end.setHours(_start.getHours() + 1);
			_end = new Date(_end);
			fm.elements['end'].value = format_date(_end);
		}

		//validate repeating events
		var repeat = fm['rrepeat'].value;
		var interval = fm['rinterval'].value;
		var end_after = fm['end_after'].value;
		var _end_after = $.fullCalendar.parseDate(end_after);

		if (repeat && parseInt(repeat) && parseInt(repeat) > 0 && interval && interval && end_after && end_after && _end_after) {
			//check whether end_after is after the end time, if not, make it valid
			if (_end_after.getTime() < _end.getTime()) {
				_end_after = new Date(_end);
				fm['end_after'].value = format_date(_end_after);
			}
		} else {
			if (!repeat && !interval && !end_after) {
				//empty fields
			} else {
				//invalid repeating events
				fm['rrepeat'].value = null;
				fm['rinterval'].value = null;
				fm['end_after'].value = null;
				err += 'Invalid repeating events!<br>';
			}
		}

		//validate relationship
		var relation = fm['relation'].value;
		var people = this.dropdowncontrol.selectpeople1[0].selectize.getValue();
		var count = people.length;

		if (count > 0) {
			if (count == 1) {
				this.dropdowncontrol.selectrelation1[0].selectize.clear();
				this.dropdowncontrol.selectrelation1[0].selectize.addOption({value: 'self', text: 'self'});
				this.dropdowncontrol.selectrelation1[0].selectize.addItem('self');
			} else {
				if (!relation || relation == '') {
					this.dropdowncontrol.selectrelation1[0].selectize.clear();
					this.dropdowncontrol.selectrelation1[0].selectize.addOption({value: 'related', text: 'related'});
					this.dropdowncontrol.selectrelation1[0].selectize.addItem('related');
				}
			}
		} else {
			if (relation) {
				//invalid values, delete relationship and people
				this.dropdowncontrol.selectpeople1[0].selectize.clear();
				this.dropdowncontrol.selectrelation1[0].selectize.clear();
				err += 'Invalid people and relationship!<br>';
			}
		}
	} else {
		err += 'Start time cannot be empty!<br>';
	}
	return err;
};

caCalendar.prototype.validateForm2 = function(el) {
	var fm = document.forms[el];
	var err = '';

	//validate time
	var start = fm['start'].value;
	var end = fm['end'].value || start;

	if (start) {
		var _start = $.fullCalendar.parseDate(start);
		var _end = $.fullCalendar.parseDate(end);

		if (_start.getTime() >= _end.getTime()) {
			_end = _end.setHours(_start.getHours() + 1);
			_end = new Date(_end);
			fm.elements['end'].value = format_date(_end);
		}

		//validate repeating events
		var repeat = fm['rrepeat'].value;
		var interval = fm['rinterval'].value;
		var end_after = fm['end_after'].value;
		var _end_after = $.fullCalendar.parseDate(end_after);

		if (repeat && parseInt(repeat) && parseInt(repeat) > 0 && interval && interval && end_after && end_after && _end_after) {
			//check whether end_after is after the end time, if not, make it valid
			if (_end_after.getTime() < _end.getTime()) {
				_end_after = new Date(_end);
				fm['end_after'].value = format_date(_end_after);
			}
		} else {
			if (!repeat && !interval && !end_after) {
				//empty fields
			} else {
				//invalid repeating events
				fm['rrepeat'].value = null;
				this.dropdowncontrol.selectinterval2[0].selectize.clear();
				fm['end_after'].value = null;
				err += 'Invalid repeating events!<br>';
			}
		}

		//validate relationship
		var relation = fm['relation'].value;
		var people = fm['people'];
		var count = 0;
		for (var i = 0; i < people.length; i++) {
			if (people[i].selected) {
				count++;
			}
		}
		if (count > 0) {
			if (count == 1) {
				this.dropdowncontrol.selectrelation2[0].selectize.clear();
				this.dropdowncontrol.selectrelation2[0].selectize.addOption({value: 'self', text: 'self'});
				this.dropdowncontrol.selectrelation2[0].selectize.addItem('self');
			} else {
				if (!relation || relation == '') {
					this.dropdowncontrol.selectrelation2[0].selectize.clear();
					this.dropdowncontrol.selectrelation2[0].selectize.addOption({value: 'related', text: 'related'});
					this.dropdowncontrol.selectrelation2[0].selectize.addItem('related');
				}
			}
		} else {
			if (relation) {
				//invalid values, delete relationship and people
				this.dropdowncontrol.selectpeople2[0].selectize.clear();
				this.dropdowncontrol.selectrelation2[0].selectize.clear();
				err += 'Invalid people and relationship!<br>';
			}
		}
	} else {
		err += 'Start time cannot be empty!<br>';
	}
	return err;
};

caCalendar.prototype.searchLocations = function(loc, el, callback) {
	if (calocation.location_list.indexOf(loc) > -1) {
		callback(null);
	} else {
		geocoder.geocode({
			'address': loc
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//valid location
				var radio_btns = '';
				var addrs = {};
				for (var i = 0; i < results.length; i++) {
					radio_btns += "<input type='radio' name='loc' value='" + results[i]["formatted_address"] + "'>" + results[i]["formatted_address"] + "<br>";
					addrs[results[i]["formatted_address"]] = results[i]["geometry"]["location"];
				}
				$("#" + el).append("<div id='location_alert'><form id='locform' name='locform'><b>Which location do you mean?</b><br>" + radio_btns + "</form></div>");

				$("#location_alert").dialog({
					width: 'auto',
					modal: true,
					buttons: {
						'None of the above': function() {
							$(this).dialog("close");
							callback(null);
						},
						'Done': function() {
							var loc_selected = $('input:radio[name=loc]:checked').val();
							$(this).dialog("close");
							if (calocation.location_list.indexOf(loc_selected) < 0) {
								$("select[name='ca_location_location']").append('<option value="' + loc_selected + '">' + loc_selected + '</option>');
								$('.field-location', $("iframe").contents()).append('<option value="' + annotation.ca_location_location + '">' + annotation.ca_location_location + '</option>');
								if (window.camap) {
									window.camap.newMarker({
										lat: addrs[loc_selected].lat(),
										lng: addrs[loc_selected].lng(),
										location: loc_selected
									})
								}
							};
							var params = "location=" + encodeURIComponent(loc_selected) + "&lat=" + addrs[loc_selected].lat() + "&lng=" + addrs[loc_selected].lng();
							ajax_request('/maps/' + window.ca_case_id, 'POST', params, callback(loc_selected));
						}
					},
					close: function(ev, ui) {
						$(this).dialog("destroy");
						$(this).remove();
					}
				})
			} else {
				$("#" + el).append("<div id='location_alert'>We could not find the location <b>" + loc + "</b>. Make sure all street and city names are spelled correctly.</div>");
				callback(null);
			}
		})
	}
};

/*caCalendar.prototype.validateEvent = function(calEvent){
	//validate relationship and people
	if(type(calEvent.people) == 'Array' && calEvent.relationship && calEvent.relationship!='') {
		//it's valid
	} else {
		if(calEvent.people) delete calEvent.people;
		if(calEvent.relationship) delete calEvent.relationship;
	}
	return calEvent;
};*/


function ajax_request(url, method, data, success) {
	data = data || {};
	success = success ||
	function() {};
	$.ajax({
		url: url,
		type: method,
		async: false,
		data: data,
		success: success,
		error: function() {
			console.log($.makeArray(arguments));
		}
	});
};

function format_date(date) {
	date = $.fullCalendar.formatDate(date, 'yyyy-MM-ddXHH:mm:ss');
	date = date.replace('X', 'T');

	return date;
};

/*function format_data(data) {
	Object.keys(data).forEach(function(attr){
		var a = type(data[attr]);
		if(a!='String' && a!='Number') {
			delete data[attr];
		}
	});
	
	return data;
};*/

function type(obj) {
	return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]
};
