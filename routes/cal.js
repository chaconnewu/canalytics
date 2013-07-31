var pool = require('../dbpool.js');
var cautility = require('../cautility.js');
var async = require('async');

exports.read = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			if (err) {
				throw err;
				conn.end();
			} else {
				conn.query("SELECT ca_events.id, ca_events.title, ca_events.start, ca_events.end, ca_events.rrepeat, ca_events.rinterval, ca_events.end_after, ca_events.rindex, ca_events.repeating, ca_events.location, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship FROM ca_events LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id where ca_calendars_id = '" + req.params.id + "' GROUP BY ca_events.id, ca_events.rindex", function(err, results) {
					var event_list = [];

					if (err) throw err;
					if (results.length > 0) {
						if (results.people) {
							for (var i = 0; i < results.length; i++) {
								results[i].people = results[i].people.split(",");
							}
						}
						event_list = results;
					}
					conn.end();
					res.send(event_list);
				})
			}
		});
	}
};

exports.create = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		async.series({
			createEvent: function(callback) {
				cautility.createEvent(req.body, function(err){
					if(err) throw err;
					
					callback(null);
				})
			},
			createRelation: function(callback) {
				if(req.body.relationship && req.body.relationship!='') {
					cautility.createRelation(req.body.people, req.body.relationship, req.body.gid, function(rid) {
						pool.getConnection(function(err, conn) {
							conn.query('UPDATE ca_events SET ca_relationships_id = ' + rid + ' WHERE id = "' + req.body.id + '"', function(err, result) {
								if (err) throw err;

								conn.end();
								callback(null);
							})
						})
					})
				} else {
					callback(null);
				}
			},
			createRepeatingEvent: function(callback) {
				if(req.body.repeating === '1') {
					cautility.createRepeatingEvent(req.body, function(err) {
						callback(err);
					})
				} else {
					callback(null);
				}
			},
			readResults: function(callback) {
				pool.getConnection(function(err, conn) {
					conn.query("SELECT ca_events.id, ca_events.title, ca_events.start, ca_events.end, ca_events.rrepeat, ca_events.rinterval, ca_events.end_after, ca_events.rindex, ca_events.repeating, ca_events.location, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship FROM ca_events LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_events.id = '" + req.body.id + "' GROUP BY ca_events.id, ca_events.rindex", function(err, results) {
						conn.end();
						callback(err, results);
					})
				})
			}
		}, function(err, results) {
			if (err) throw err;

			var data = {};
			data.results = results.readResults;
			res.send(data);
		});
	}
};

exports.update = function(req, res) {
	var update_list = ['title', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'location'];
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var qs = {};
		Object.keys(req.body).forEach(function(key) {
			if (update_list.indexOf(key) > -1) {
				if (req.body[key] != '') {
					qs[key] = req.body[key];
				}
			}
		})

		async.waterfall([

		function(callback) {
			//search old relationship
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relationships.id AS id, ca_relationships.relationship AS relationship FROM ca_relationships JOIN ca_events ON ca_events.ca_relationships_id = ca_relationships.id WHERE ca_events.id = "' + req.params.id + '" AND ca_events.rindex = ' + req.body.rindex, function(err, results) {
					if (err) throw err;

					conn.end();
					callback(null, results);
				})
			})
		}, 
		function(results, callback) {
			var rid = null;
			var relation = null;
			if(results.length > 0) {
				rid = results[0].id;
				relation = results[0].relationship;
			}
				cautility.compareRelation(rid, relation, req.body.relationship, req.body.people, req.body.rrepeat, req.body.rindex, req.body.gid, function(err, rid, insert_list, delete_list) {
					callback(null, rid, insert_list, delete_list);
				})
		}, 
		function(rid, insert_list, delete_list, callback) {
			cautility.createPeople(rid, insert_list, function(err) {
				callback(err, rid, delete_list);
			})
		}, 
		function(rid, delete_list, callback) {
			cautility.deletePeople(rid, delete_list, function(err) {
				callback(err, rid);
			})
		}, 
		function(rid, callback) {
			qs.ca_relationships_id = rid;
			cautility.updateEvent(req.params.id, qs, req.body, function(err) {
				callback(err);
			})
		}, 
		function(callback) {
			cautility.clearRelationTable(function(err) {
				callback(err);
			})
		},
			function(callback) {
				cautility.clearLocationTable(function(err) {
					callback(err);
				})
			},
			function(callback) {
			//read results
			pool.getConnection(function(err, conn) {
				conn.query("SELECT ca_events.id, ca_events.title, ca_events.start, ca_events.end, ca_events.rrepeat, ca_events.rinterval, ca_events.end_after, ca_events.rindex, ca_events.repeating, ca_events.location, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship FROM ca_events LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_events.id = '" + req.params.id + "' GROUP BY ca_events.id, ca_events.rindex", function(err, results) {
					if(err) throw err;
					
					var data = {};
					data.results = results;

					conn.end();
					callback(null, data);
				})
			})
		}], 
		function(err, data) {
			if (err) throw err;
			res.send(data);
		});
	}
};

exports.delete = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		async.waterfall([

		function(callback) {
			//process relationship
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relationships.id AS id, ca_relationships.relationship AS relationship FROM ca_relationships JOIN ca_events ON ca_events.ca_relationships_id = ca_relationships.id WHERE ca_events.id = "' + req.params.id + '" AND ca_events.rindex = ' + req.body.rindex, function(err, results) {
					if (err) throw err;

					conn.end();
					callback(null, results);
				})
			})
		}, function(results, callback) {
			if (results.length > 0) {
				var rid = results[0].id;
				var rel = results[0].relationship;

					//delete the relationship, then delete the event
					pool.getConnection(function(err, conn) {
						conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, results) {
							if (err) throw err;

							var r_delete = [];
							for (var i in results) {
								var r = {};
								r.id = rid;
								r.name = results[i].name;
								r.relationship = rel;
								r_delete.push(r);
							}

							conn.query('DELETE FROM ca_relationships WHERE id = ' + rid, function(err, results) {
								if (err) throw err;

								conn.end();
								callback(null, r_delete);
							})
						})
					})
			} else {
				//no existing relationships associated with this event, only delete the event
				callback(null, null);
			}
		}, function(r_delete, callback) {
			//process event
			if (req.body.idx) {
				//delete a repeating event
				if (req.body.idx.charAt(0) == "x") {
					//delete all future events beyond this index
					console.log('req.body.idx is ' + req.body.idx);
					var idx = req.body.idx.substring(1);
					console.log('idx is '+idx);
					pool.getConnection(function(err, conn) {
						console.log('DELETE FROM ca_events WHERE id = "' + req.params.id + '" AND rindex >= ' + idx);
						conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '" AND rindex >= ' + idx, function(err, result) {
							if (err) throw err;

							conn.end();
							callback(null, null);
						})
					})
				} else {
					//only delete this event
					pool.getConnection(function(err, conn) {
						conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '" AND rindex = ' + req.body.idx, function(err, result) {
							if (err) throw err;

							conn.end();
							callback(null, null);
						})
					})
				}
			} else {
				//delete a non-repeating event that has the id
				pool.getConnection(function(err, conn) {
					conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '"', function(err, result) {
						if (err) throw err;

						conn.end();
						callback(null, r_delete);
					})
				})
			}
		}], function(err, r_delete) {
			if (err) throw err;

			var data = {};
			data.id = req.params.id;
			data.r_delete = r_delete;
			res.send(data);
		})
	}
}
