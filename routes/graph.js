var pool = require('../dbpool.js');
var async = require('async');

exports.read = function(req, res) {
	if(typeof req.session.username === "undefined"){
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				conn.query('SELECT ca_relation.id AS id, ca_relation.relation AS relation, ca_person.name AS name FROM ca_relation JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_relation.id = ' + req.params.id, function(err, results){
					if(err) throw err;
					conn.end();
					res.send(results);
				})
			}
		})
	}
};

exports.readall = function(req, res){
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			if(err){
				conn.end();
			}else{
				conn.query("(SELECT ca_person.name AS name, ca_relation.relation AS relation, ca_relation.id AS id, ca_event.start AS start, ca_event.end AS end, ca_event.title AS text, ca_event.ca_location_location AS ca_location_location FROM ca_person JOIN ca_relation ON ca_relation.id = ca_person.ca_relation_id JOIN ca_event ON ca_event.ca_relation_id = ca_relation.id WHERE ca_relation.ca_case_id = " + req.params.id + ") UNION (SELECT ca_person.name AS name, ca_relation.relation AS relation, ca_relation.id AS id, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.text AS text, ca_annotation.ca_location_location AS ca_location_location FROM ca_person JOIN ca_relation ON ca_relation.id = ca_person.ca_relation_id JOIN ca_annotation ON ca_annotation.ca_relation_id = ca_relation.id WHERE ca_relation.ca_case_id = " + req.params.id + ")", function(err, results){
					var relation_list = [];
					var data = {};
					
					if(err) throw err;
					
					data.relationlist = results

					conn.end();

					res.send(data);
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
					conn.query('SELECT GROUP_CONCAT(ca_person.name) AS people, ca_relationships.relationship AS relationship, ca_event.id AS eid, ca_event.rindex AS idx, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end FROM ca_event LEFT JOIN ca_relationships ON ca_event.ca_relationships_id = ca_relationships.id LEFT JOIN ca_person ON ca_relationships.id = ca_person.ca_relationships_id WHERE ca_event.ca_relationships_id IN ' + req.query.relations + '" GROUP BY ca_event.id, ca_event.rindex', function(err, results){
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
	var cols = ['id','title','start','end','repeat','interval','end_after','ca_calendar_id','ca_calendar_ca_case_id'];
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
				var query = conn.query('INSERT INTO ca_event SET ?', qs, 
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
	var update_list = ['title','start','end','repeat','interval','end_after','ca_calendar_id'];
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
				var query = conn.query('UPDATE ca_event SET ? WHERE id = "' + req.params.id + '"', qs,
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
				var query = conn.query('DELETE FROM ca_event WHERE id = "' + req.params.id + '"', 
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
				var query = conn.query('SELECT DISTINCT ca_person.name AS name FROM ca_person JOIN ca_relation ON ca_person.ca_relation_id = ca_relation.id WHERE ca_relation.ca_case_id = ' + req.params.id, 
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
				var query = conn.query('SELECT DISTINCT relation FROM ca_relation WHERE ca_case_id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					conn.end();
					res.send(result);
				});
			}
		});
	}
};






















