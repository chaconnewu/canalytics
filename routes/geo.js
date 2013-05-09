var pool = require('../dbpool.js');
var async = require('async');

exports.read = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var query = conn.query('SELECT location FROM ca_locations WHERE ca_maps_id = "' + req.params.id + '"', 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(result);
				});
			}
		});
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
				console.log(req.body);
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