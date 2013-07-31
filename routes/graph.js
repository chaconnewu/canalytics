var pool = require('../dbpool.js');
var async = require('async');

exports.read = function(req, res){
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				conn.query("SELECT ca_people.name, ca_relationships.relationship, ca_relationships.id FROM ca_relationships JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_relationships.ca_graphs_id = '" + req.params.id + "'", function(err, results){
					var relation_list = [];
					
					if(err) throw err;
					if(results.length > 0) {
						relation_list = results;
					}
					conn.end();
					
					res.send(relation_list);
				})
			}
		})
	}
};

exports.readfacts = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		console.log(req.query);
		async.series({
			eve_loc: function(callback){
				pool.getConnection(function(err, conn){
					conn.query('SELECT GROUP_CONCAT(ca_people.name) AS people, ca_relationships.relationship AS relationship, ca_events.id AS eid, ca_events.rindex AS idx, ca_events.title AS title, ca_events.start AS start, ca_events.end AS end FROM ca_events LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_events.ca_relationships_id IN ' + req.query.relations + '" GROUP BY ca_events.id, ca_events.rindex', function(err, results){
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
	var cols = ['id','title','start','end','repeat','interval','end_after','ca_calendars_id','ca_calendars_ca_cases_id'];
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var qs = {};
				Object.keys(req.body).forEach(function(key){
					if(cols.indexOf(key) > -1) qs[key] = req.body[key];
				})
				var query = conn.query('INSERT INTO ca_events SET ?', qs, 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(req.body);
				})
			}
		});
	}	
};

exports.update = function(req, res) {
	var update_list = ['title','start','end','repeat','interval','end_after','ca_calendars_id'];
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var qs = {};
				Object.keys(req.body).forEach(function(key){
					if(update_list.indexOf(key) > -1) qs[key] = req.body[key];
				})
				var query = conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs,
				function(err, result){
					if(err) throw err;
					conn.end();
					req.body.id = req.params.id;
					res.send(req.body);
				});
			}
		});
	}	
};

exports.delete = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var query = conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '"', 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(req.params.id);
				});
			}
		});
	}	
};

exports.people = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var query = conn.query('SELECT DISTINCT ca_people.name AS name FROM ca_people JOIN ca_relationships ON ca_people.ca_relationships_id = ca_relationships.id JOIN ca_graphs ON ca_relationships.ca_graphs_id = ca_graphs.id WHERE ca_graphs.ca_cases_id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(result);
				});
			}
		});
	}
};

exports.relations = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				var query = conn.query('SELECT DISTINCT ca_relationships.relationship AS relationship FROM ca_relationships JOIN ca_graphs ON ca_relationships.ca_graphs_id = ca_graphs.id WHERE ca_graphs.ca_cases_id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(result);
				});
			}
		});
	}
};






















