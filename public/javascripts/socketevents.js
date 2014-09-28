clientId = null, nickname = null, currentRoom = null, socket = io.connect(SOCKET_SERVER);
var usercolor = {};

// when the connection is made, the server emiting
// the 'connect' event
socket.on('connect', function() {
	// firing back the connect event to the server
	// and sending the room name for the connected client
	socket.emit('connect', {
		room: window.ca_case_id
	});
});

// after the initialize, the server sends a list of
// all the active rooms
socket.on('roomslist', function(data) {
	for (var i = 0, len = data.rooms.length; i < len; i++) {
		// in socket.io, there is always one default room
		// without a name (empty string), every socket is
		// automatically joined to this room, however, we
		// don't want this room to be displayed in the
		// rooms list
		if (data.rooms[i] != '') {
			addRoom(data.rooms[i], false);
		}
	}
});

socket.on('reloadlocation', function(data) {
	window.calocation.location_list = [];

	for (var i = 0; i < data.locationlist.length; i++) {
		window.calocation.location_list.push(data.locationlist[i].location);
	}

	if (window.camap) {
		window.camap.reload(data);
	}
});

socket.on('reloadrelation', function(data) {
	window.capeople.people_list = [];
	window.capeople.relation_list = [];

	for (var i = 0; i < data.relationlist.length; i++) {
		window.capeople.relation_list.push(data.relationlist[i].relation);
	}

	for (var i = 0; i < data.peoplelist.length; i++) {
		window.capeople.people_list.push(data.peoplelist[i].name);
	}

	if (window.cagraph) {
		window.cagraph.reload(data.graphlist);
	}
})

socket.on('createlocation', function(data) {
	if(calocation.location_list.indexOf(data.id)<0) {
		if (window.camap) {
			$.get('/maps/locations/position/' + data.id, function(results) {
				window.camap.newMarker({
					lat: results[0].lat,
					lng: results[0].lng,
					location: data.id
				});
			});
		}

		calocation.location_list.push(data.id);
		calocation.location_options.push({
			value: data.id,
			text: data.id
		});

		for (var i=0; i<window.dropdownlists.locationlists.length; i++) {
			var ll = window.dropdownlists.locationlists[i];
			ll[0].selectize.addOption({
				value: data.id,
				text: data.id
			});
			ll[0].selectize.refreshOptions();
		}
	}

	addLog('<span class="logtext">Location <font color="black">' + data.id.substring(0,10) + '...</font> is created by '  + data.locationlist[0].creator + '<font class="logtime">' + data.updated + '</font></span>', data.locationlist[0].creator);
});

socket.on('createevent', function(data) {
	var results = data.eventlist;
	if (window.cacalendar) {

		var e = window.cacalendar.el.fullCalendar('clientEvents', data.id);

		if (e.length != results.length) {
			window.cacalendar.el.fullCalendar('removeEvents', results[0].id);
			for (var i = 0; i < results.length; i++) {
				window.cacalendar.el.fullCalendar('renderEvent', results[i], true);
			}
		} else {
			for (var i = 0; i < results.length; i++) {
				$.extend(e[i], results[i]);
				window.cacalendar.el.fullCalendar('updateEvent', e[i]);
			}
		}
	}
	addLog('<span class="logtext">Event <font color="black">' + data.eventlist[0].title.substring(0,10) + '...</font> is created by ' + results[0].creator + '.<font class="logtime">' + data.updated + '</font></span>', results[0].creator);

});

socket.on('updateevent', function(data) {
		var results = data.eventlist;
	if (window.cacalendar) {

		var e = window.cacalendar.el.fullCalendar('clientEvents', data.id);

		if (e.length != results.length) {
			window.cacalendar.el.fullCalendar('removeEvents', results[0].id);
			for (var i = 0; i < results.length; i++) {
				window.cacalendar.el.fullCalendar('renderEvent', results[i], true);
			}
		} else {
			for (var i = 0; i < results.length; i++) {
				$.extend(e[i], results[i]);
				window.cacalendar.el.fullCalendar('updateEvent', e[i]);
			}
		}
	}
	addLog('<span class="logtext">Event <font color="black">' + data.eventlist[0].title.substring(0,10) + '...</font> is updated by ' + results[0].creator + '. <font class="logtime">' + data.updated + '</font></span>', results[0].creator);
});

socket.on('deleteevent', function(data) {
	if (window.cacalendar) {
		var e = window.cacalendar.el.fullCalendar('clientEvents', data.id);
		window.cacalendar.el.fullCalendar('removeEvents', data.id);
		addLog('<span class="logtext">Event <font color="black">' + e[0].title.substring(0,10) + '...</font> is deleted. <font class="logtime">' + data.updated + '</font></span>');
	}
});

socket.on('createrelation', function(data) {
	if (window.cagraph) {
		window.cagraph.load(data);
	}

	if(capeople.relation_list.indexOf(data.relationlist[0].relation)<0) {
		capeople.relation_list.push(data.relationlist[0].relation);
		capeople.relation_options.push({
			value: data.relationlist[0].relation,
			text: data.relationlist[0].relation
		});
		for (var i in window.dropdownlists.relationlists) {
			window.dropdownlists.relationlists[i][0].selectize.addOption({
				value: data.relationlist[0].relation,
				text: data.relationlist[0].relation
			});
			window.dropdownlists.relationlists[i][0].selectize.refreshOptions();
		}
	}

	var people = [];
	for(var i in data.relationlist){
		if(capeople.people_list.indexOf(data.relationlist[i].name)<0) {
			capeople.people_list.push(data.relationlist[i].name);
			capeople.people_options.push({
				value: data.relationlist[i].name,
				text: data.relationlist[i].name
			});
			for (var j in window.dropdownlists.peoplelists) {
				window.dropdownlists.peoplelists[j][0].selectize.addOption({
					value: data.relationlist[i].name,
					text: data.relationlist[i].name
				});
				window.dropdownlists.peoplelists[j][0].selectize.refreshOptions();
			}
		}
		people.push(data.relationlist[i].name);
	}
	if (people.length > 1) { // only show the log if the relation is for more than one person
  addLog('<span class="logtext">Relation <font color="black">' + data.relationlist[0].relation + 'among ' + people.join(' </b> and <b>') + '</b> is created by ' + data.relationlist[0].creator + '. <font class="logtime">' + data.updated + '</font></span>', data.relationlist[0].creator);
	}
});

socket.on('updaterelation', function(data) {
	if (window.cagraph) {
		window.cagraph.load(data);
	}

	var people = "";
	for(var i in data.relationlist){
		if(capeople.people_list.indexOf(data.relationlist[i].name)<0) {
			capeople.people_list.push(data.relationlist[i].name);
			capeople.people_options.push({
				value: data.relationlist[i].name,
				text: data.relationlist[i].name
			});
			for (var j in window.dropdownlists.peoplelists) {
				window.dropdownlists.peoplelists[j][0].selectize.addOption({
					value: data.relationlist[i].name,
					text: data.relationlist[i].name
				});
				window.dropdownlists.peoplelists[j][0].selectize.refreshOptions();
			}
		}
		people += data.relationlist[i].name + ' ';
	}

	addLog('<span class="logtext">Relation <font color="black">' + data.relationlist[0].relation + ' among ' + people + ' is updated by ' + data.relationlist[0].creator + '</font>. <font class="logtime">' + data.updated + '</font></span>', data.relationlist[0].creator);
});

socket.on('deleterelation', function(data) {
	if (window.cagraph) {
		window.cagraph.unload(data.id);
	}
});

// when someone creates/updates an annotation, the server push it to
// our client through this event with a relevant data
socket.on('createannotation', function(data) {
	var annotation;

	annotation = data.annotation;
	annotation.ranges = [];
	annotation.ranges[0] = {
		start: annotation.range_start,
		startOffset: annotation.startOffset,
		end: annotation.range_end,
		endOffset: annotation.endOffset
	};
	if (annotation.people) {
		annotation.people = annotation.people.split(",")
	}

	var ifm = $("#iframe_" + annotation.ca_doc_uuid).get(0);
	if (ifm) {
		var myAnnotator = ifm.contentWindow.MyAnnotator;
		if (myAnnotator) {
			var i = __indexOf(annotation, myAnnotator.plugins['Store'].annotations);
			if (i < 0) {
				myAnnotator.plugins['Store'].registerAnnotation(annotation);
				myAnnotator.setupAnnotation(annotation, false);
			} else {
				var old_annotation = myAnnotator.plugins['Store'].annotations[i];
				$.extend(old_annotation, annotation);
				$(old_annotation.highlights).data('annotation', old_annotation);
			}
		}
	}

	var log = addLog('<span class="logtext annotation">Annotation <font color="black">' + annotation.text.substring(0,10) + '...</font> is created by ' + annotation.creator + '. <font class="logtime">' + data.updated + '</font></span>', annotation.creator);
  log.data('annotation', annotation);
});

socket.on('updateannotation', function(data) {
	var annotation;

	annotation = data.annotation;
	annotation.ranges = [];
	annotation.ranges[0] = {
		start: annotation.range_start,
		startOffset: annotation.startOffset,
		end: annotation.range_end,
		endOffset: annotation.endOffset
	};
	if (annotation.people) {
		annotation.people = annotation.people.split(",")
	}

	var ifm = $("#iframe_" + annotation.ca_doc_uuid).get(0);
	if (ifm) {
		var myAnnotator = ifm.contentWindow.MyAnnotator;
		if (myAnnotator) {
			var i = __indexOf(annotation, myAnnotator.plugins['Store'].annotations);
			if (i < 0) {
				myAnnotator.plugins['Store'].registerAnnotation(annotation);
				myAnnotator.setupAnnotation(annotation, false);
			} else {
				var old_annotation = myAnnotator.plugins['Store'].annotations[i];
				$.extend(old_annotation, annotation);
				$(old_annotation.highlights).data('annotation', old_annotation);
			}
		}
	}

	var log = addLog('<span class="logtext">Annotation <font color="black">' + annotation.text.substring(0,10) + '...</font> is updated by ' + annotation.creator + '. <font class="logtime">' + data.updated + '</font></span>', annotation.creator);
  log.data('annotation', annotation);
});

// when someone deletes an annotation, the server push it to
// our client through this event with a relevant data
socket.on('deleteannotation', function(data) {
	var ifm = $("#iframe_" + data.ca_doc_uuid).get(0);
	if (ifm) {
		var myAnnotator = ifm.contentWindow.MyAnnotator;
		if (myAnnotator) {
			var i = __indexOf(data, myAnnotator.plugins['Store'].annotations);
			if (i >= 0) {
				var annotation = myAnnotator.plugins['Store'].annotations[i];

					addLog('<span class="logtext">Annotation <font color="black">' + annotation.text.substring(0,10) + '...</font> is deleted.<font class="logtime">' + data.updated + '</font></span>');

				var h, _k, _len2, _ref1;
				_ref1 = annotation.highlights;
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					h = _ref1[_k];
					$(h).replaceWith(h.childNodes);
				}
				myAnnotator.plugins['Store'].unregisterAnnotation(annotation);
			}
		}
	}
});

// when we subscribes to a room, the server sends a list
// with the clients in this room
socket.on('roomclients', function(data) {
	// add the room name to the rooms list
	//addRoom(data.room, false);
	// set the current room
	//setCurrentRoom(data.room);
	// announce a welcome message
	console.log('Welcome to the room: ' + data.room + "!");

	// add the client to the clients list
	addClient({
		username: username,
		//userid: clientId
	}, false, true);
	for (var i = 0, len = data.clients.length; i < len; i++) {
		if (data.clients[i]) {
			addClient(data.clients[i], false);
		}
	}
});

// if someone creates a room the server updates us
// about it
socket.on('addroom', function(data) {
	addRoom(data.room, true);
});

// if one of the room is empty from clients, the server,
// destroys it and updates us
socket.on('removeroom', function(data) {
	removeRoom(data.room, true);
});

// with this event the server tells us when a client
// is connected or disconnected to the current workspace
socket.on('presence', function(data) {
	if (data.state == 'online') {
		addClient(data.client, true);
	} else if (data.state == 'offline') {
		removeClient(data.client, true);
	}
});

// add a room to the rooms list, socket.io may add
// a trailing '/' to the name so we are clearing it

function addRoom(name, announce) {
	// clear the trailing '/'
	name = name.replace('/', '');

	// if announce is true, show a message about this room
	if (announce) {
		console.log('The room ' + name + ' created');
	}
};

// remove a room from the rooms list

function removeRoom(name, announce) {
	// if announce is true, show a message about this room
	if (announce) {
		console.log('The room ' + name + ' destroyed');
	}
};

// add a client to the clients list

function addClient(client, announce, isMe) {
  if (!usercolor[client.username]) {
    // generate random color, taken from stackoverlow
    // http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
    var color = "#"+((1<<24)*Math.random()|0).toString(16);
    usercolor[client.username] = color;
  }
	// if this is our client, mark him with color
	console.log(client);
	if (isMe) {
		//$html.addClass('me');
	}
	// if announce is true, show a message about this client
	if (announce) {
		console.log(client.username + ' has joined the room');
	}
};

// remove a client from the clients list

function removeClient(client, announce) {
	// if announce is true, show a message about this room
	if (announce) {
		console.log(client.username + ' has left the room');
	}
};

// every client can join workspaces that he has access to, when join,
// the client is unsubscribed from the current room and then subscribed
// to the room he just created

function joinRoom(room) {
	if (room && room != currentRoom) {
		console.log('Joining room: ' + room);

		// unsubscribe from the current room
		//if(currentRoom != null){
		//socket.emit('unsubscribe', { room: currentRoom });
		//}
		// create and subscribe to the new room
		socket.emit('subscribe', {
			room: room
		});
	}
};

// sets the current room when the client
// makes a subscription

function setCurrentRoom(room) {
	currentRoom = room;
};

// Search for item in an array of items,
// if the id of the item equals the id of
// an item in items, return the index of
// the item, if no item is found, return
// -1. This function only returns
// the first item that matches. Logically,
// the id is unique in the system, so there
// should be at most one item matches.

function __indexOf(item, items) {
	for (var i = 0, len = items.length; i < len; i++) {
		if (item.id == items[i].id) {
			return i;
		}
	}
	return -1;
};

function addLog(str, user) {
  return $(str).css('color', usercolor[user])
    .hide() // to animate the prepend, hide the element first
    .prependTo($('#activitylog'))
    .slideDown();
}

$(function() {
  $('#activitylog').on('click', '.logtext', function() {
    var annotation = $(this).data('annotation');
    if (annotation) {
      var window_id = "#iframe_" + annotation.ca_doc_uuid;
      var ifm = $(window_id).get(0);
      if (!ifm) {
        // the window is not opened yet
        $('ul#documents').find('a').each(function(i, a) {
          a = $(a);
          if (a.data('uuid') ===  annotation.ca_doc_uuid) {
            var href = a.attr('href');
            caWindows.openWindow(href, annotation.ca_doc_uuid, a.data('title'), 'annotation');
            ifm = $(window_id).get(0);
            $(ifm.contentWindow).load(function() {
              jump2annotation();
            });
            return false;
          }
        });
      } else {
        bringToTop($(ifm).parents('.cabox'));
        jump2annotation();
      }



      function jump2annotation() {
        var myAnnotator = ifm.contentWindow.MyAnnotator;
        if (myAnnotator) {
          var i = __indexOf(annotation, myAnnotator.plugins['Store'].annotations);
          if (i > -1) {
           annotation = myAnnotator.plugins['Store'].annotations[i];
            var highlight = $(annotation.highlights[0]);
            if (highlight) {
              highlight.addClass('active');
              $('body', ifm.contentDocument).animate({
                scrollTop: highlight.offset().top - 30
              });
            }
          }
        }
      }
    }
  });
})
