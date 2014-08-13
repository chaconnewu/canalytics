var pool = require('../dbpool.js');
var async = require('async');

exports.readall = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var query = conn.query('SELECT * FROM ca_location WHERE ca_case_id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(result);
				});
			}
		});
	}
};

exports.readLatLng = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			} else {
				conn.query('SELECT lat, lng FROM ca_location WHERE location = "' + req.params.id + '"', function(err, results){
					if(err) throw err;
					conn.end();
					res.send(results);
				})
			}
		})
	}
};

exports.readfacts = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		async.series({
			eve_loc: function(callback){
				pool.getConnection(function(err, conn){
					conn.query('SELECT GROUP_CONCAT(ca_person.name) AS people, ca_relation.relation AS relation, ca_event.id AS eid, ca_event.rindex AS idx, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_event.ca_case_id = ' + req.query.ca_case_id + ' AND ca_event.ca_location_location = "' + req.params.id + '" GROUP BY ca_event.id, ca_event.rindex', function(err, results){
						if(err) throw err;
						conn.end();
						console.log(results);
						callback(null, results);
					})
				})
			},
			ann_loc: function(callback){
				pool.getConnection(function(err, conn){
					conn.query('SELECT GROUP_CONCAT(ca_person.name) AS people, ca_relation.relation AS relation, ca_annotation.id AS aid, ca_annotation.text AS text FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_annotation.ca_case_id = ' + req.query.ca_case_id + ' AND ca_annotation.ca_location_location = "' + req.params.id + '" GROUP BY ca_annotation.id', function(err, results){
						if(err) throw err;
						console.log(results);
						conn.end();
						callback(null, results);
					})
				})
			}
		}, function(err, results){
			if(err) throw err;
			console.log(results);
			res.send(results);
		})
	}
};

exports.create = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			} else {
				conn.query('INSERT INTO ca_location SET ? ON DUPLICATE KEY UPDATE lat=lat, lng=lng', {
					location: req.body.location,
					lat: req.body.lat,
					lng: req.body.lng,
					creator: req.session.username,
					ca_case_id: req.params.id
				}, function(err, result) {
					if(err) throw err;
					
					conn.end();
					res.send('Success');
				})
			}
		})
	}
}