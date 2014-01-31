function caCalendar(el, options) {
	this.el = el;
	this.el.addClass('cacalendar');
	this.dropdowncontrol = {};
	this.options = $.extend(this.defaultoptions, {
		dayClick: this.showEventEditor.bind(this),
		eventClick: this.showEventEditor.bind(this),
		eventMouseover: this.showEvent.bind(this),
		eventMouseout: this.hideEvent
		//select: this.showNewEventSelector.bind(this)
	}, options);
	this.eventEditor = null;
	this.calEvent = null;

	this.setupEventEditor();
	this.setupDropDownList();

	el.fullCalendar(this.options);
};

caCalendar.prototype.reload = function(data) {
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

	this.dropdowncontrol.selectlocation = $("#selectlocation").selectize({
		hideSelected: true,
		options: calocation.location_options,
		create: function(input) {
			_this.searchLocations(input, 'eventeditor', function(loc_selected) {
				if (loc_selected) {
					calocation.location_list.push(loc_selected);
					calocation.location_options.push({
						value: loc_selected,
						text: loc_selected
					});
					for (var i in window.dropdownlists.locationlists) {
						window.dropdownlists.locationlists[i][0].selectize.addOption({
							value: input,
							text: input
						});
					}
					return {
						value: input,
						text: input
					}
				}
				return null;
			})
		}
	});
	window.dropdownlists.locationlists.push(this.dropdowncontrol.selectlocation);

	this.dropdowncontrol.selectpeople = $("#selectpeople").selectize({
		hideSelected: true,
		options: capeople.people_options,
		create: function(input) {
			capeople.people_list.push(input);
			capeople.people_options.push({
				value: input,
				text: input
			});
			for (var i in window.dropdownlists.peoplelists) {
				window.dropdownlists.peoplelists[i][0].selectize.addOption({
					value: input,
					text: input
				});
			}
			return {
				value: input,
				text: input
			}
		}
	});
	window.dropdownlists.peoplelists.push(this.dropdowncontrol.selectpeople);

	this.dropdowncontrol.selectrelation = $("#selectrelation").selectize({
		hideSelected: true,
		options: capeople.relation_options,
		create: function(input) {
			capeople.relation_list.push(input);
			capeople.relation_options.push({
				value: input,
				text: input
			});
			for (var i in window.dropdownlists.relationlists) {
				window.dropdownlists.relationlists[i][0].selectize.addOption({
					value: input,
					text: input
				});
			}
			return {
				value: input,
				text: input
			}
		}
	});
	window.dropdownlists.relationlists.push(this.dropdowncontrol.selectrelation);

	this.dropdowncontrol.selectinterval = $("#selectinterval").selectize();
};

caCalendar.prototype.setupEventEditor = function() {
	var _this = this;
	var win = this.el;

	var d = new Date();

	var html = "<form id='eventform' name='eventform'><input type='hidden' name='ca_case_id' value='" + window.ca_case_id + "'><input type='hidden' name='rindex' value=0><label for='title'>Notes:</label><textarea name='title' cols='27' rows='4'>New Event</textarea><br><select id='selectlocation' placeholder='Location' name='location' tabindex='6'></select><br><select id='selectpeople' multiple placeholder='People' name='people' tabindex='6'></select><br><select id='selectrelation' placeholder='Relation' name='relation' tabindex='6'></select><br><label for='start'>From:</label><input type='datetime-local' name='start' value='" + d + "'><br><label for='end'>To:</label><input type='datetime-local' name='end' value='" + d + "'><br><label for='rrepeat'>Repeat Every</label><input type='text' name='rrepeat'> <select id='selectinterval' name='rinterval'><option value='day(s)'>Day(s)</option><option value='week(s)'>Week(s)</option><option value='month(s)'>Month(s)</option></select><br><label for='end_after'>End On Date:</label><input type='datetime-local' name='end_after'><br><input id='calpost' class='form_btn' type='button' value='Done'><input id='calcncl' class='form_btn' type='button' value='Cancel'><input id='caldel' class='form_btn' type='button' value='Delete'><br><div id='event_status'></div></form>";

	var div = $('<div id="eventeditor" class="eventeditor"></div>').appendTo($('body'));
	div.addClass('eventeditor-hidden');

	var eventform = $(html).appendTo(div);
	eventform.prepend("<div id='errmsg'></div>");

	$("#calpost").click(function() {
		var err = _this.validateForm("eventform");
		if (err) {
			$("#errmsg").html(err);
		} else {
			var params = eventform.serialize();
			if (_this.calEvent) {
				//existing event
				if (_this.calEvent.rrepeat) {
					div.append("<div id='repeating_alert'><b>You're changing a repeating event.</b><br>Do you want to change only this occurrence of the event, or this and all future occurrences?</div>");

					$("#repeating_alert").dialog({
						width: 'auto',
						modal: true,
						buttons: {
							'Cancel': function() {
								$(this).dialog("close");
								div.addClass('eventeditor-hidden');
								eventform[0].reset();
								win.removeClass('editing');
								_this.calEvent = null;
								$('#event_status').load('/desync', function() {
									$('#eventform :input').prop('disabled', false);
								});
							},
							'All Future Events': function() {
								$(this).dialog("close");
								params += "&idx=x" + _this.calEvent.rindex;
								div.addClass('eventeditor-hidden');
								eventform[0].reset();
								win.removeClass('editing');
								ajax_request('/calendars/events/' + _this.calEvent.id, 'PUT', params, function(data) {
									_this.calEvent = null;
									$('#event_status').load('/desync', function() {
										$('#eventform :input').prop('disabled', false);
										_this.updateEvent(data);
									});
								});
							},
							'Only This Event': function() {
								$(this).dialog("close");
								params += "&idx=" + _this.calEvent.rindex;
								div.addClass('eventeditor-hidden');
								eventform[0].reset();
								win.removeClass('editing');
								ajax_request('/calendars/events/' + _this.calEvent.id, 'PUT', params, function(data) {
									_this.calEvent = null;
									$('#event_status').load('/desync', function() {
										$('#editingevent :input').prop('disabled', false);
										_this.updateEvent(data);
									});
								});
							}
						},
						close: function(ev, ui) {
							$(this).dialog("destroy").remove();
						}
					})
				} else {
					div.addClass('eventeditor-hidden');
					editingeventform[0].reset();
					win.removeClass('editing');
					ajax_request('/calendars/events/' + _this.calEvent.id, 'PUT', params, function(data) {
						_this.calEvent = null;
						$('#event_status').load('/desync', function() {
							$('#editingevent :input').prop('disabled', false);
							_this.updateEvent(data);
						});
					});
				}
		} else {
			//new event
			div.addClass('eventeditor-hidden');
			eventform[0].reset();
			win.removeClass('editing');
			ajax_request('/calendars/events', 'POST', params, _this.updateEvent.bind(_this));
		}
	}
	});
//
$("#calcncl").click(function() {
	div.addClass('eventeditor-hidden');
	eventform[0].reset();
	win.removeClass('editing');
	_this.calEvent = null;
	$('#event_status').load('/desync', function() {
		$('#eventform :input').prop('disabled', false);
	});
});
//
$("#caldel").click(function() {
	if (_this.calEvent) {
		//existing event
		if (_this.calEvent.rrepeat) {
			div.append("<div id='repeating_alert'><b>You're deleting a repeating event.</b><br>Do you want to delete only the selected occurrence, or this and all future occurrences of this event?</div>");

			$("#repeating_alert").dialog({
				width: 'auto',
				modal: true,
				buttons: {
					'Cancel': function() {
						$(this).dialog("close");
						div.addClass('eventeditor-hidden');
						eventform[0].reset();
						win.removeClass('editing');
						_this.calEvent = null;
						$('#event_status').load('/desync', function() {
							$('#eventform :input').prop('disabled', false);
						});
					},
					'Delete All Future Events': function() {
						$(this).dialog("close");
						div.addClass('eventeditor-hidden');
						eventform[0].reset();
						win.removeClass('editing');
						var params = "idx=x" + _this.calEvent.rindex + "&rindex=" + _this.calEvent.rindex;
						ajax_request('/calendars/events/' + _this.calEvent.id, 'DELETE', params, function(data) {
							_this.calEvent = null;
							$('#event_status').load('/desync', function() {
								$('#eventform :input').prop('disabled', false);
								_this.updateEvent(data);
							});
						});
					},
					'Delete Only This Event': function() {
						$(this).dialog("close");
						div.addClass('eventeditor-hidden');
						eventform[0].reset();
						win.removeClass('editing');
						var params = "idx=" + _this.calEvent.rindex + "&rindex=" + _this.calEvent.rindex;
						ajax_request('/calendars/events/' + _this.calEvent.id, 'DELETE', params, function(data) {
							_this.calEvent = null;
							$('#event_status').load('/desync', function() {
								$('#eventform :input').prop('disabled', false);
								_this.updateEvent(data);
							});
						});
					}
				},
				close: function(ev, ui) {
					$(this).dialog("destroy").remove();
				}
			})
		} else {
			div.addClass('eventeditor-hidden');
			eventform[0].reset();
			win.removeClass('editing');
			ajax_request('/calendars/events/' + _this.calEvent.id, 'DELETE', params, function(data) {
				_this.calEvent = null;
				$('#event_status').load('/desync', function() {
					$('#eventform :input').prop('disabled', false);
					_this.updateEvent(data);
				});
			});
		}
	} else {
		//new event, do nothing
		div.addClass('eventeditor-hidden');
		eventform[0].reset();
		win.removeClass('editing');
	}
});

win.click(function(e) {
	e.stopPropagation();
});
div.click(function(e) {
	e.stopPropagation();
});
$(document).click(function() {
	div.addClass('eventeditor-hidden');
	eventform[0].reset();
	win.removeClass('editing');
	$('#event_status').load('/desync', function() {
		$('#eventform :input').prop('disabled', false);
	});
})
this.eventEditor = div;
};

caCalendar.prototype.showEventEditor = function() {
	var _this = this;

	var win = this.el;

	if (win.hasClass('editing')) return false;

	win.addClass('editing');

	this.eventEditor.removeClass('eventeditor-hidden');

	this.dropdowncontrol.selectpeople[0].selectize.clear();
	this.dropdowncontrol.selectpeople[0].selectize.refreshOptions();
	this.dropdowncontrol.selectpeople[0].selectize.refreshItems();
	this.dropdowncontrol.selectrelation[0].selectize.clear();
	this.dropdowncontrol.selectrelation[0].selectize.refreshOptions();
	this.dropdowncontrol.selectrelation[0].selectize.refreshItems();
	this.dropdowncontrol.selectlocation[0].selectize.clear();
	this.dropdowncontrol.selectlocation[0].selectize.refreshOptions();
	this.dropdowncontrol.selectlocation[0].selectize.refreshItems();
	this.dropdowncontrol.selectinterval[0].selectize.clear();

	if (arguments.length === 3) {
		//for event click, will receive calEvent, jsEvent, view
		var calEvent = arguments[0];
		var jsEvent = arguments[1];
		var view = arguments[2];
		_this.calEvent = calEvent;

		if (calEvent.ca_annotation_id) return false;

		this.hideEvent(calEvent, jsEvent, view);
		this.eventEditor.offset({
			top: jsEvent.pageY,
			left: jsEvent.pageX
		});
		this.eventEditor.css('z-index', 99999);

		$('#event_status').load('/sync', {
			id: 'event_' + calEvent.id
		}, function(data) {
			if (data.indexOf('please try again') !== -1) {
				$('#eventform :input').prop('disabled', true);

				$("#calcncl").prop('disabled', false);
				$("#calcncl").click(function() {
					div.addClass('eventeditor-hidden');
					eventform[0].reset();
					win.removeClass('editing');
					$('#event_status').load('/desync', function() {
						$('#eventform :input').prop('disabled', false);
						return false;
					});
				});
			}

			var el = $(jsEvent.target).closest('.fc-event');

			var div = $('#eventeditor');

			var eventform = $('#eventform');

			var start = format_date(calEvent.start);

			var end = format_date(calEvent.end);

			var end_after = calEvent.end_after;

			$('<input>').attr({
				type: 'hidden',
				name: 'id'
			}).appendTo('#eventform');


			var people_list = [];
			if (calEvent.people) people_list = calEvent.people.split(',');
			for (var i in people_list) {
				_this.dropdowncontrol.selectpeople[0].selectize.addItem(people_list[i])
			}

			_this.dropdowncontrol.selectrelation[0].selectize.addItem(calEvent.relation);

			_this.dropdowncontrol.selectlocation[0].selectize.addItem(calEvent.ca_location_location);

			_this.dropdowncontrol.selectinterval[0].selectize.addItem(calEvent.rinterval);

			$('#eventform textarea[name=title]').val(calEvent.title);
			$('#eventform input[name=rrepeat]').val(calEvent.rrepeat);
			$('#eventform input[name=start]').val(start);
			$('#eventform input[name=end]').val(end);
			$('#eventform input[name=end_after]').val(end_after);
			$("#err").html('');

			return false;
		});
	} else {
		//for day click, will receive date, allDay, jsEvent, view
		var date = arguments[0];
		var allDay = arguments[1];
		var jsEvent = arguments[2];
		var view = arguments[3];

		var d = format_date(date);

		var el = $(jsEvent.target);

		//		var x = this.newEventEditor.offset();
		//		var y = jsEvent.clientX;
		this.eventEditor.offset({
			top: jsEvent.pageY,
			left: jsEvent.pageX
		});
		this.eventEditor.css('z-index', 99999);

		$('#eventform input[name=start]').val(d);
		$('#eventform input[name=end]').val(d);
		$("#err").html('');

		return false;
	}
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

caCalendar.prototype.validateForm = function(el) {
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
		var people = this.dropdowncontrol.selectpeople[0].selectize.getValue();
		var count = people.length;

		if (count > 0) {
			if (count == 1) {
				this.dropdowncontrol.selectrelation[0].selectize.clear();
				this.dropdowncontrol.selectrelation[0].selectize.addOption({
					value: 'self',
					text: 'self'
				});
				this.dropdowncontrol.selectrelation[0].selectize.addItem('self');
			} else {
				if (!relation || relation == '') {
					this.dropdowncontrol.selectrelation[0].selectize.clear();
					this.dropdowncontrol.selectrelation[0].selectize.addOption({
						value: 'related',
						text: 'related'
					});
					this.dropdowncontrol.selectrelation[0].selectize.addItem('related');
				}
			}
		} else {
			if (relation) {
				//invalid values, delete relationship and people
				this.dropdowncontrol.selectpeople[0].selectize.clear();
				this.dropdowncontrol.selectrelation[0].selectize.clear();
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
						$(this).dialog("destroy").remove();
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
