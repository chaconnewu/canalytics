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
				var query = conn.query('SELECT * FROM ca_locations WHERE ca_maps_id = "' + req.params.id + '"', 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(result);
				});
			}
		});
	}
};

exports.readfacts = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		async.series({
			eve_loc: function(callback){
				pool.getConnection(function(err, conn){
					conn.query('SELECT GROUP_CONCAT(ca_people.name) AS people, ca_relationships.relationship AS relationship, ca_events.id AS eid, ca_events.rindex AS idx, ca_events.title AS title, ca_events.start AS start, ca_events.end AS end FROM ca_calendars JOIN ca_events ON ca_events.ca_calendars_id = ca_calendars.id LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_calendars.ca_cases_id = ' + req.query.cid + ' AND ca_events.location = "' + req.params.id + '" GROUP BY ca_events.id, ca_events.rindex', function(err, results){
						if(err) throw err;
						
						conn.end();
						callback(null, results);
					})
				})
			},
			ann_loc: function(callback){
				callback(null, null);
			}
		}, function(err, results){
			if(err) throw err;
			
			res.send(results.eve_loc);
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
				conn.query('INSERT INTO ca_locations SET ?', {
					location: req.body.location,
					ca_maps_id: req.body.mid,
					lat: req.body.lat,
					lng: req.body.lng
				}, function(err, result) {
					if(err) throw err;
					
					conn.end();
					res.send('Success');
				})
			}
		})
	}
}