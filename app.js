
/**
 * Module dependencies.
 */

var express = require('express')
	, MemoryStore = express.session.MemoryStore
  , index = require('./routes/index')
	, cahandler = require('./routes/cahandler')
	, store = require('./routes/store')
	, cal = require('./routes/cal')
	, graph = require('./routes/graph')
	, geo = require('./routes/geo')
	, logger = require('./routes/activitylog')
  , http = require('http')
  , path = require('path')
	, sharejs = require('share').server
	, sio = require('socket.io')
	, cookieParser = require('cookie')
	, sessionStore = new MemoryStore()
	, Session = require('connect').middleware.session.Session;
var pool = require('./dbpool.js');

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
  app.use(express.cookieParser());
  app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// specify routes and handlers when a client makes
// a request to a particular path
app.get('/', index.index);
app.post('/login', index.login);
app.post('/signup', index.signup);
app.get('/mycases', cahandler.mycases);
app.get('/mycase/*', cahandler.mycase);
app.get('/store', store.information);
app.get('/store/annotations/:ca_case_id', store.findall);
app.post('/store/annotations', store.create);
app.put('/store/annotations/:id', store.update);
app.delete('/store/annotations/:id', store.delete);
app.get('/store/search/:ca_case_id', store.search);
app.get('/calendars/:id', cal.readall);
app.get('/calendars/search/:id', cal.search)
app.post('/calendars/events', cal.create);
app.get('/calendars/events/:id', cal.read);
app.put('/calendars/events/:id', cal.update);
app.delete('/calendars/events/:id', cal.delete);
app.get('/graphs/:id', graph.readall);
app.get('/graphs/relations/:id', graph.read);
app.get('/graphs/', graph.readfacts);
app.get('/people/:id', graph.people);
app.get('/relations/:id', graph.relations);
app.get('/maps/:id', geo.readall);
app.get('/maps/location/:id', geo.readfacts);
app.get('/maps/locations/position/:id', geo.readLatLng);
app.post('/maps/:id', geo.create);
app.get('/filter', cahandler.filter);
app.post('/sync', index.sync);
app.get('/desync', index.desync);
app.get('/logout', index.logout);
app.post('/activitylog', logger.activitylog);

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

io.set('authorization', function(data, accept) {
	//check if there's a cookie header
	if(data.headers.cookie) {
		// if there is, parse the cookie
		data.cookie = cookieParser.parse(data.headers.cookie);
		// note that you will need to use the same key to grad the
		// session id, as you specified in the Express setup.
		data.sessionID = data.cookie['express.sid'].split('.')[0];
		data.sessionID = data.sessionID.split(':')[1];
		// save the session store to the data object
		// (as required by the Session constructor)
		data.sessionStore = sessionStore;
		sessionStore.get(data.sessionID, function(err, session) {
			if(err || !session) {
				//if we cannot grab a session, turn down the connection
				accept('Error', false);
			} else {
				//create a session object, passing data as request and our
				//just acquired session data
				data.session = new Session(data, session);
				accept(null, true);
			}
		})
	} else {
		// if there isn't, turn down the connection with a message
		// and leave the function.
		return accept('No cookie transmitted.', false);
	}
});

// socket.io events, each connection goes through here
// and each event is emited in the client.
// I created a function to handle each event
io.sockets.on('connection', function(socket){
	var hs = socket.handshake;
	console.log('A socket with sessionID ' + hs.sessionID + ' connected!');
	// setup an interval that will keep our session fresh
	var intervalID = setInterval(function() {
		// reload the session (just in case something changed,
		// we don't want to override anything, but the age)
		// reloading will also ensure we keep an up2date copy
		// of the session with our connection.
		hs.session.reload(function() {
			// "touch" it (resetting maxAge and lastAccess)
			// and save it back again.
			hs.session.touch().save();
		})
	}, 60 * 1000);

	socket.on('error', function(err) {
		if(err === 'handshake error') {
			console.log('handshake error', err);
		} else {
			console.log('io error', err);
		}
	});

	socket.on('disconnect', function() {
		disconnect(socket);
		console.log('A socket with sessionID ' + hs.sessionID + ' disconnected!');
		// clear the socket interval to stop refreshing the session
		clearInterval(intervalID);
	});

	// after connection, the client sends us the
	// nickname through the connect event
	socket.on('connect', function(data){
		connect(socket, data);
	});

	socket.on('reloadlocation', function(data){
		reloadlocation(socket, data);
	});

	socket.on('reloadrelation', function(data){
		reloadrelation(socket, data);
	});

	socket.on('createannotation', function(data){
		createannotation(socket, data);
	});

	socket.on('updateannotation', function(data){
		updateannotation(socket, data);
	});

	socket.on('deleteannotation', function(data){
		deleteannotation(socket, data);
	});

	socket.on('createevent', function(data){
		createevent(socket, data);
	});

	socket.on('updateevent', function(data){
		updateevent(socket, data);
	});

	socket.on('deleteevent', function(data){
		deleteevent(socket, data);
	});

	socket.on('createlocation', function(data){
		createlocation(socket, data);
	});

	socket.on('createrelation', function(data){
		createrelation(socket, data);
	});

	socket.on('updaterelation', function(data){
		updaterelation(socket, data);
	});

	socket.on('deleterelation', function(data){
		deleterelation(socket, data);
	});

	// when a client sends a message, he emits
	// this event, then the server forwards the
	// message to other clients in the same workspace
/*	socket.on('DBEventUpdated', function(data){
		dbeventupdated(socket, data);
	});*/

	// client subscribtion to a workspace
	socket.on('subscribe', function(data){
		subscribe(socket, data);
	})

	// client unsubscribtion from a workspace
	socket.on('unsubscribe', function(data){
		unsubscribe(socket, data);
	});

});

//hash object to save clients data,
// {socketid:{username, uid}, socketid:{...}}
var chatClients = new Object();

// create a client for the socket
function connect(socket, data){
	// save the client to the hash object for
	// quick access, we can save this data on
	// the socket with 'socket.set(key, value);
	// but the only way to pull it back will be
	// async
	chatClients[socket.id] = {
		username: socket.handshake.session.username
	};
	// subscribe the client to the room
	subscribe(socket, { room: data.room });
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


function createannotation(socket, data) {
  console.error('create annotation');
	pool.getConnection(function(err, conn) {
		conn.query('SELECT ca_annotation.id AS id, ca_annotation.text AS text, ca_annotation.quote AS quote, ca_annotation.range_start AS range_start, ca_annotation.range_end AS range_end, ca_annotation.startOffset AS startOffset, ca_annotation.endOffset AS endOffset, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.rrepeat AS rrepeat, ca_annotation.rinterval AS rinterval, ca_annotation.end_after AS end_after, ca_annotation.ca_location_location AS ca_location_location, ca_annotation.ca_doc_uuid AS ca_doc_uuid, ca_annotation.ca_case_id AS ca_case_id, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation, ca_annotation.color AS color, ca_annotation.creator AS creator FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_annotation.id = ' + data.id, function(err, result) {
			if(err) throw err;

			data.annotation = result[0];
			conn.end();
			io.sockets.in(data.room).emit('createannotation', data);
		})
	})
};

function updateannotation(socket, data) {
	pool.getConnection(function(err, conn) {
		conn.query('SELECT ca_annotation.id AS id, ca_annotation.text AS text, ca_annotation.quote AS quote, ca_annotation.range_start AS range_start, ca_annotation.range_end AS range_end, ca_annotation.startOffset AS startOffset, ca_annotation.endOffset AS endOffset, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.rrepeat AS rrepeat, ca_annotation.rinterval AS rinterval, ca_annotation.end_after AS end_after, ca_annotation.ca_location_location AS ca_location_location, ca_annotation.ca_doc_uuid AS ca_doc_uuid, ca_annotation.ca_case_id AS ca_case_id, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation, ca_annotation.color AS color, ca_annotation.creator AS creator FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_annotation.id = ' + data.id, function(err, result) {
			if(err) throw err;

			data.annotation = result[0];
			conn.end();
			io.sockets.in(data.room).emit('createannotation', data);
		})
	})
};

function deleteannotation(socket, data) {
	var temp = data.id.split('_');
	data.id = temp[0];
	data.ca_doc_uuid = temp[1];
	io.sockets.in(data.room).emit('deleteannotation', data);
};

function createevent(socket, data) {
		pool.getConnection(function(err, conn) {
			conn.query("SELECT ca_event.id AS id, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end, ca_event.rrepeat AS rrepeat, ca_event.rinterval AS rinterval, ca_event.end_after AS end_after, ca_event.rindex AS rindex, ca_event.ca_location_location AS ca_location_location, ca_event.creator AS creator, ca_event.editors AS editors, ca_event.color as color, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_event.id = " + data.id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
				console.log(results);
				data.eventlist = results;
				conn.end();
				console.log('emiting io.sockets.in'+data.room+'createevent');
				console.log(getRooms());
				io.sockets.in(data.room).emit('createevent', data);
			});
		})
};

function updateevent(socket, data) {
	pool.getConnection(function(err, conn) {
		conn.query("SELECT ca_event.id AS id, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end, ca_event.rrepeat AS rrepeat, ca_event.rinterval AS rinterval, ca_event.end_after AS end_after, ca_event.rindex AS rindex, ca_event.ca_location_location AS ca_location_location, ca_event.creator AS creator, ca_event.editors AS editors, ca_event.color as color, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_event.id = " + data.id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
			data.eventlist = results;
			conn.end();
			io.sockets.in(data.room).emit('updateevent', data);
		});
	})
};

function deleteevent(socket, data) {
	io.sockets.in(data.room).emit('deleteevent', data);
};

function createlocation(socket, data) {
	pool.getConnection(function(err, conn){
		if(err){
			conn.end();
		}else{
			console.log(data);
			conn.query("SELECT location, creator, color FROM ca_location WHERE location = '" + data.id + "'", function(err, results){
				if(err) throw err;

				data.locationlist = results;
				conn.end();
				io.sockets.in(data.room).emit('createlocation', data);
			})
		}
	})
};

function createrelation(socket, data) {
	pool.getConnection(function(err, conn){
		if(err){
			conn.end();
		}else{
			conn.query("SELECT ca_person.name AS name, ca_relation.relation AS relation, ca_relation.id AS id, ca_relation.color AS color, ca_relation.creator FROM ca_person JOIN ca_relation ON ca_relation.id = ca_person.ca_relation_id WHERE ca_relation.id = " + data.id, function(err, results){
				if(err) throw err;

				data.relationlist = results;
				conn.end();
				io.sockets.in(data.room).emit('createrelation', data);
			})
		}
	})
};

function reloadrelation(socket, data) {
	pool.getConnection(function(err, conn){
		if(err){
			conn.end();
		}else{
			conn.query('SELECT DISTINCT ca_person.name AS name FROM ca_person JOIN ca_relation ON ca_person.ca_relation_id = ca_relation.id WHERE ca_relation.ca_case_id = ' + data.id, function(err, results){
				if(err) throw err;

				data.peoplelist = results;
				conn.query('SELECT DISTINCT relation FROM ca_relation WHERE ca_case_id = ' + data.id, function(err, results){
					if(err) throw err;

					data.relationlist = results;

					conn.query("(SELECT ca_person.name AS name, ca_relation.relation AS relation, ca_relation.id AS id, ca_event.start AS start, ca_event.end AS end, ca_event.title AS text, ca_event.ca_location_location AS ca_location_location FROM ca_person JOIN ca_relation ON ca_relation.id = ca_person.ca_relation_id JOIN ca_event ON ca_event.ca_relation_id = ca_relation.id WHERE ca_relation.ca_case_id = " + data.id + ") UNION (SELECT ca_person.name AS name, ca_relation.relation AS relation, ca_relation.id AS id, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.text AS text, ca_annotation.ca_location_location AS ca_location_location FROM ca_person JOIN ca_relation ON ca_relation.id = ca_person.ca_relation_id JOIN ca_annotation ON ca_annotation.ca_relation_id = ca_relation.id WHERE ca_relation.ca_case_id = " + data.id + ")", function(err, results){
						if(err) throw err;

						data.graphlist = results;

						conn.end();
						io.sockets.in(data.room).emit('reloadrelation', data);
					})
				})
			})
		}
	})
};

function reloadlocation(socket, data) {
	pool.getConnection(function(err, conn){
		if(err){
			conn.end();
		}else{
			conn.query('SELECT * FROM ca_location WHERE ca_location.ca_case_id = ' + data.id, function(err, results){
				if(err) throw err;

				data.locationlist = results;
				conn.end();
				io.sockets.in(data.room).emit('reloadlocation', data);
			})
		}
	})
};

function updaterelation(socket, data) {
	pool.getConnection(function(err, conn){
		if(err){
			conn.end();
		}else{
			conn.query('SELECT ca_relation.id AS id, ca_relation.relation AS relation, ca_person.name AS name FROM ca_relation JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_relation.id = ' + data.id, function(err, results){
				if(err) throw err;

				data.relationlist = results;
				conn.end();
				io.sockets.in(data.room).emit('updaterelation', data);
			})
		}
	})
};

function deleterelation(socket, data){
	io.sockets.in(data.room).emit('deleterelation', data);
};

// receive a new/revised event from a client and
// send it to the relevant workspace
/*function dbeventupdated(socket, data){
	 // by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	console.log("dbeventupdated got data "+data);
	socket.broadcast.to(data.room).emit('DBEventUpdated', data);
};*/


// subscribe a client to a room
function subscribe(socket, data){
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
