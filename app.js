
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
	, cahandler = require('./routes/cahandler')
	, store = require('./routes/store')
	, cal = require('./routes/cal')
	, graph = require('./routes/graph')
	, geo = require('./routes/geo')
  , http = require('http')
  , path = require('path')
	, sharejs = require('share').server
	, sio = require('socket.io');

//declare two global variables for recording synchronization status
blocklist = {},
userblocklist = {};

var app = express();

// configure express, since this server is
// also a web server, we need to define the
// paths to the static files
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// specify routes and handlers when a client makes
// a request to a particular path
app.get('/', routes.index);
app.get('/users', user.list);
app.post('/login', routes.login);
app.post('/signup', routes.signup);
app.get('/mycases', cahandler.mycases);
app.get('/mycase/*', cahandler.mycase);
app.get('/store', store.information);
app.get('/store/annotations', store.findall);
app.post('/store/annotations', store.create);
app.put('/store/annotations/:id', store.update);
app.delete('/store/annotations/:id', store.delete);
app.get('/store/search', store.search);
app.get('/calendars/:id', cal.read);
app.post('/calendars/events', cal.create);
app.put('/calendars/events/:id', cal.update);
app.delete('/calendars/events/:id', cal.delete);
app.get('/graphs/:id', graph.read);
app.get('/graphs/', graph.readfacts);
app.get('/people/:id', graph.people);
app.get('/relations/:id', graph.relations);
app.get('/maps/:id', geo.readall);
app.get('/maps/location/:id', geo.readfacts);
app.post('/maps/location', geo.create);
app.post('/sync', routes.sync);
app.get('/desync', routes.desync);
app.get('/logout', routes.logout);


var server = http.createServer(app);

var io = sio.listen(server);

// sets the log level of socket.io, with
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
io.set('log level', 2);

// setting the transports by order, if some client
// is not supporting 'websockets' then the server will
// revert to 'xhr-polling' (like Comet/Long polling).
// for more configurations go to:
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
io.set('transports', [ 'websocket', 'xhr-polling' ]);

// socket.io events, each connection goes through here
// and each event is emited in the client.
// I created a function to handle each event
io.sockets.on('connection', function(socket){
	
	// after connection, the client sends us the 
	// nickname through the connect event
	socket.on('connect', function(data){
		connect(socket, data);
	});

	// when a client sends a message, he emits
	// this event, then the server forwards the
	// message to other clients in the same workspace
	socket.on('DBAnnotationUpdated', function(data){
		dbannotationupdated(socket, data);
	});

	// when a client sends a message, he emits
	// this event, then the server forwards the
	// message to other clients in the same workspace
	socket.on('DBEventUpdated', function(data){
		dbeventupdated(socket, data);
	});
	
	// when a client deletes an event, he emits
	// this event, then the server forwards the
	// message to other clients in the same workspace
	socket.on('DBEventDeleted', function(data){
		dbeventdeleted(socket, data);
	});
	
	// client subscribtion to a workspace
	socket.on('subscribe', function(data){
		subscribe(socket, data);
	})

	// client unsubscribtion from a workspace
	socket.on('unsubscribe', function(data){
		unsubscribe(socket, data);
	});

	// when a client calls the 'socket.close();
	// function or closes the browser, this event
	// is built in socket.io so we actually dont
	// need to fire it manually
	socket.on('disconnect', function(){
		disconnect(socket);
	});
});

//hash object to save clients data,
// {socketid:{clientid, nickname}, socketid:{...}}
var chatClients = new Object();

// create a client for the socket
function connect(socket, data){
	//generate clientId
	data.clientId = generateId();

	// save the client to the hash object for
	// quick access, we can save this data on
	// the socket with 'socket.set(key, value);
	// but the only way to pull it back will be
	// async
	chatClients[socket.id] = data;
	
	// now the client object is ready, update
	// the client
	socket.emit('ready', { clientId: data.clientId });
	
	// auto subscribe the client to the 'lobby'
	//subscribe(socket, { room: 'lobby' });
	
	// sends a list of all active rooms in the
	// server
	//socket.emit('roomlist', { rooms: getRooms() });
};

// when a client disconnect, unsubscribe him from
// the rooms he subscribed to
function disconnect(socket){
	// get a list of rooms for the client
	var rooms = io.sockets.manager.roomClients[socket.id];
		
	// unsubscribe from the rooms
	for(var room in rooms){
		if(room && rooms[room]){
			unsubscribe(socket, { room: room.replace('/','') });
		}
	}
		
	// client was unsubscribed from the rooms,
	// now we can delete him from the hash object
	delete chatClients[socket.id];
};
	
// receive a new/revised annotation from a client and
// send it to the relevant workspace
function dbannotationupdated(socket, data){
	 // by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	console.log("dbannotationupdated got data "+data);
	socket.broadcast.to(data.room).emit('DBAnnotationUpdated', data);
};

// receive a new/revised event from a client and
// send it to the relevant workspace
function dbeventupdated(socket, data){
	 // by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	console.log("dbeventupdated got data "+data);
	socket.broadcast.to(data.room).emit('DBEventUpdated', data);
};

// receive a deleted event from a client and
// send it to the relevant workspace
function dbeventdeleted(socket, data){
	 // by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	console.log("dbeventdeleted event.id " + data.id);
	socket.broadcast.to(data.room).emit('DBEventDeleted', data);
};

// subscribe a client to a room
function subscribe(socket, data){
	console.log("joining the room" + data.room);
	// get a list of all active rooms
	var rooms = getRooms();
		
	// check if this room exists, if not, update all
	// other clients about this new room
	//if(rooms.indexOf('/' + data.room) < 0){
		//socket.broadcast.emit('addroom', { room: data.room });
	//}
		
	// subscribe the client to the room
	socket.join(data.room);
		
	// update all other clients about the online
	// presence
	updatePresence(data.room, socket, 'online');
		
	// send to the client a list of all subscribed clients
	// in this room
	socket.emit('roomclients', { room: data.room, clients:
		getClientsInRoom(socket.id, data.room) });
};
	
// unsubscribe a client from a workspace, this can be
// occured when a client disconnected from the server
// or he subscribed to another workspace
function unsubscribe(socket, data){
	// update all other clients about the offline
	// presence
	updatePresence(data.room, socket, 'offline');
	
	// remove the client from socket.io room
	socket.leave(data.room);
		
	// if this client was the only one in that room
	// we are updating all clients about that the
	// room is destroyed
	if(!countClientsInRoom(data.room)){
		// with 'io.sockets' we can contact all the
		// clients that connected to the server
		io.sockets.emit('removeroom', { room: data.room });
	}
};
	
// 'io.sockets.manager.rooms' is an object that holds
// the active room names as a key, returning array of
// room names
function getRooms(){
	return Object.keys(io.sockets.manager.rooms);
};
	
// get array of clients in a room
function getClientsInRoom(socketId, room){
	// get array of socket ids in this room
	var socketIds = io.sockets.manager.rooms['/' + room];
	var clients = [];
		
	if(socketIds && socketIds.length >0 ){
		socketsCount = socketIds.length;
			
		// push every client to the result array
		for(var i=0, len=socketIds.length; i<len; i++){
			// check if the socket is not the requesting
			// socket
			if(socketIds[i] != socketId){
				clients.push(chatClients[socketIds[i]]);
			}
		}
	}
	return clients;
};
	
// get the amount of clients in room
function countClientsInRoom(room){
	// 'io.sockets.manager.rooms' is an object that holds
	// the active room names as a key and an array of
	// all subscribed client socket ids
	if(io.sockets.manager.rooms['/' + room]){
		return io.sockets.manager.rooms['/' + room].length;
	}
	return 0;
};
	
// updating all other clients when a client goes
// online or offline.
function updatePresence(room, socket, state){
	// socket.io may add a trailing '/' to the
	// room name so we are clearing it
	room = room.replace('/','');
		
	// by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	socket.broadcast.to(room).emit('presence', {client:
		chatClients[socket.id], state: state, room: room });
};
	
// unique id generator
function generateId(){
	var S4 = function () {
	  return (((1 + Math.random()) * 0x10000) | 
	                                     0).toString(16).substring(1);
	 };
		 return (S4() + S4() + "-" + S4() + "-" + S4() + "-" +
		                S4() + "-" + S4() + S4() + S4());
};


server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
