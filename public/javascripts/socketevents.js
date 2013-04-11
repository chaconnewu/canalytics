clientId = null,
nickname = null,
currentRoom = null,
socket = io.connect('http://localhost:3000');

// when the connection is made, the server emiting
// the 'connect' event
socket.on('connect', function(){
	// firing back the connect event to the server
	// and sending the nickname for the connected client
	socket.emit('connect', { nickname: account });
});

// after the server created a client for us, the ready event
// is fired in the server with our clientId, now we can start
socket.on('ready', function(data){
	// saving the clientId locally
	clientId = data.clientId;
	
	// join the client to the current case
	joinRoom(caseName);
});

// after the initialize, the server sends a list of
// all the active rooms
socket.on('roomslist', function(data){
	for(var i=0, len=data.rooms.length; i<len; i++){
		// in socket.io, there is always one default room
		// without a name (empty string), every socket is
		// automatically joined to this room, however, we
		// don't want this room to be displayed in the
		// rooms list
		if(data.rooms[i] != ''){
			addRoom(data.rooms[i], false);
		}
	}
});

// when someone creates/updates an annotation, the server push it to
// our client through this event with a relevant data
socket.on('DBAnnotationUpdated', function(data){
	//display the message in the console
	var myAnnotator = $("#iframe_"+data.docid).get(0).contentWindow.MyAnnotator;
	if(myAnnotator){
		var i = __indexOf(data, myAnnotator.plugins['Store'].annotations);
		if(i < 0) {
			myAnnotator.plugins['Store'].registerAnnotation(data);
			myAnnotator.setupAnnotation(data, false);
		} else {
			var annotation = myAnnotator.plugins['Store'].annotations[i];
			$.extend(annotation, data);
			$(annotation.highlights).data('annotation', annotation);
		}
	}
});

// when someone creates/updates an event, the server push it to
// our client through this event with a relevant data
socket.on('DBEventUpdated', function(data){
	var el = $("#"+data.el);
  var e = el.fullCalendar('clientEvents', data.id);

	if(e.length > 0) {
		for(var i=0;i<e.length; i++){
			$.extend(e[i], data);
			e[i] = validateEvent(e[i]);
			el.fullCalendar( 'updateEvent', e[i]);
		};
	} else {
		el.fullCalendar( 'renderEvent', data, true);
	}
	if(data.people){
		for(var i in data.people) {
			if(capeople.people_list.indexOf(data.people[i]) == -1){
				capeople.people_list.push(data.people[i]);
			}
		}
	}
	if(data.relationship&&data.relationship!=''){
		if(capeople.relation_list.indexOf(data.relationship) == -1){
			capeople.relation_list.push(data.relationship);
		}
	}
	
	if(window.cagraph){
		if(data.r_insert){
			window.cagraph.load(data.r_insert);
		}
		if(data.r_delete){
			window.cagraph.unload(data.r_delete);
		}
	}
});

// when someone deletes an event, the server push it to
// our client through this event with the event id
socket.on('DBEventDeleted', function(data){
	var el = $("#"+data.el);
  var e = el.fullCalendar('clientEvents', data.id);
	
	el.fullCalendar( 'removeEvents', data.id);
	
	if(window.cagraph){
		if(data.r_delete){
			window.cagraph.unload(data.r_delete);
		}
	}
});

// when we subscribes to a room, the server sends a list
// with the clients in this room
socket.on('roomclients', function(data){
	// add the room name to the rooms list
	addRoom(data.room, false);
	
	// set the current room
	setCurrentRoom(data.room);
	
	// announce a welcome message
	console.log('Welcome to the room: ' + data.room + "!");
	
	// add the clients to the clients list
	addClient({ nickname: nickname, clientId: clientId }, false, true);
	for(var i=0, len = data.clients.length; i<len; i++){
		if(data.clients[i]){
			addClient(data.clients[i], false);
		}
	}
});

// if someone creates a room the server updates us
// about it
socket.on('addroom', function(data){
	addRoom(data.room, true);
});

// if one of the room is empty from clients, the server,
// destroys it and updates us
socket.on('removeroom', function(data){
	removeRoom(data.room, true);
});

// with this event the server tells us when a client
// is connected or disconnected to the current workspace
socket.on('presence', function(data){
	if(data.state == 'online'){
		addClient(data.client, true);
	} else if(data.state == 'offline'){
		removeClient(data.client, true);
	}
});

// add a room to the rooms list, socket.io may add
// a trailing '/' to the name so we are clearing it
function addRoom(name, announce){
	// clear the trailing '/'
	name = name.replace('/','');
	
	// if announce is true, show a message about this room
	if(announce){
		console.log('The room ' + name + ' created');
	}
};

// remove a room from the rooms list
function removeRoom(name, announce){
	// if announce is true, show a message about this room
	if(announce){
		console.log('The room ' + name + ' destroyed');
	}
};

// add a client to the clients list
function addClient(client, announce, isMe){
	// if this is our client, mark him with color
	if(isMe){
		//$html.addClass('me');
	}
	// if announce is true, show a message about this client
	if(announce){
		console.log(client.nickname + ' has joined the room');
	}
};

// remove a client from the clients list
function removeClient(client, announce){
	// if announce is true, show a message about this room
	if(announce){
		console.log(client.nickname + ' has left the room');
	}
};

// every client can join workspaces that he has access to, when join, 
// the client is unsubscribed from the current room and then subscribed 
// to the room he just created
function joinRoom(room){
	if(room && room != currentRoom){
		console.log('Joining room: ' + room);
		
		// unsubscribe from the current room
		//if(currentRoom != null){
			//socket.emit('unsubscribe', { room: currentRoom });
		//}
		
		// create and subscribe to the new room
		socket.emit('subscribe', { room: room });
	}
};

// sets the current room when the client
// makes a subscription
function setCurrentRoom(room){
	currentRoom = room;
}

// Search for item in an array of items,
// if the id of the item equals the id of
// an item in items, return the index of
// the item, if no item is found, return
// -1. This function only returns
// the first item that matches. Logically,
// the id is unique in the system, so there
// should be at most one item matches.
function __indexOf(item, items){
	for(var i=0, len=items.length; i<len; i++){
		if(item.id == items[i].id) {
			return i;
		}
	}
	return -1;
}