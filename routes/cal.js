var pool = require('../dbpool.js');
var cautility = require('../cautility.js');
var async = require('async');

exports.readall = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			if (err) {
				throw err;
				conn.end();
			} else {
				conn.query("SELECT ca_event.id, ca_event.ca_annotation_id, ca_event.title, ca_event.start, ca_event.end, ca_event.rrepeat, ca_event.rinterval, ca_event.end_after, ca_event.rindex, ca_event.ca_location_location, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id where ca_event.ca_case_id = " + req.params.id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
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

exports.search = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn){
			conn.query("SELECT ca_event.id, ca_event.ca_annotation_id, ca_event.title, ca_event.start, ca_event.end, ca_event.rrepeat, ca_event.rinterval, ca_event.end_after, ca_event.rindex, ca_event.ca_location_location, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id where ca_event.id IN (" + req.query.eid.join() + ") GROUP BY ca_event.id, ca_event.rindex", function(err, results){
				var event_list = [];
				
				if(err) throw err;
				if(results.length>0){
					if(results.people){
						for(var i=0;i<results.length;i++){
							results[i].people = results[i].people.split(",");
						}
					}
					event_list = results;
				}
				conn.end();
				res.send(event_list);
			})
		})
	}
};

exports.read = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			if (err) {
				throw err;
				conn.end();
			} else {
				conn.query("SELECT ca_event.id, ca_event.ca_annotation_id, ca_event.title, ca_event.start, ca_event.end, ca_event.rrepeat, ca_event.rinterval, ca_event.end_after, ca_event.rindex, ca_event.ca_location_location, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id where ca_event.id = " + req.params.id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
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
	console.log(req.body);
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var msg = [];
		async.waterfall([
			function(callback) {
				cautility.createEvent(req.body, function(id){
					callback(null, id);
				})
			},
			function(id, callback) {
				if(req.body.relation) {
					cautility.createRelation(req.body.people, req.body.relation, req.body.ca_case_id, function(rid) {
						msg.push({
							operation: 'create',
							resource: 'relation',
							id: rid,
							updated: new Date()
						});
						pool.getConnection(function(err, conn) {
							conn.query('UPDATE ca_event SET ca_relation_id = ' + rid + ' WHERE id = ' + id, function(err, result) {
								if (err) throw err;

								conn.end();
								callback(null, id);
							})
						})
					})
				} else {
					callback(null, id);
				}
			},
			function(id, callback) {
				if(req.body.rrepeat && parseInt(req.body.rrepeat) > 0) {
					cautility.createRepeatingEvent(id, req.body, function(err) {
						callback(err, id);
					})
				} else {
					callback(null, id);
				}
			},
			function(id, callback) {
				pool.getConnection(function(err, conn) {
					conn.query("SELECT ca_event.id AS id, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end, ca_event.rrepeat AS rrepeat, ca_event.rinterval AS rinterval, ca_event.end_after AS end_after, ca_event.rindex AS rindex, ca_event.ca_location_location AS ca_location_location, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_event.id = " + id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
						conn.end();
						callback(err, results);
					})
				})
			}
		], function(err, results) {
			if (err) throw err;

			var events = {};
			events.id = results[0].id;
			events.eventlist = results;
			events.msg = msg;
			events.updated = new Date();
			events.owner = req.session.username;
			res.send(events);
		});
	}
};

exports.update = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var qs = {};
			var update_list = ['title', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'ca_location_location'];
			
		Object.keys(req.body).forEach(function(key) {
			if (update_list.indexOf(key) > -1) {
				if (req.body[key] != '') {
					qs[key] = req.body[key];
				}
			}
		})
		var msg = [];
		async.waterfall([

		function(callback) {
			//search old relationship
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relation.id AS id, ca_relation.relation AS relation FROM ca_relation JOIN ca_event ON ca_event.ca_relation_id = ca_relation.id WHERE ca_event.id = "' + req.params.id + '" AND ca_event.rindex = ' + req.body.rindex, function(err, results) {
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
				relation = results[0].relation;
			} 
				cautility.compareRelation(rid, relation, req.body.relation, req.body.people, req.body.rrepeat, req.body.rindex, req.body.ca_case_id, msg, function(err, rid, insert_list, delete_list) {
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
			qs.ca_relation_id = rid;
			
			pool.getConnection(function(err, conn) {
				conn.query('SELECT rrepeat FROM ca_event WHERE id = "' + req.params.id + '"', function(err, results) {
					if(err) throw err;
					
					if(results[0].rrepeat) {
						//it's a repeating event
						if(req.body.rrepeat) {
							//update the repeating event
							cautility.updateEvent(req.params.id, qs, req.body, function(err) {
								conn.end();
								callback(err);
							});
						} else {
							//change from a repeating event to a non-repeating event
							cautility.deleteEvent(req.params.id, {idx: 'x1'}, function(err) {
								conn.end();
								callback(err);
							})
						}
					} else {
						//it's a non-repeating event
						if(req.body.rrepeat) {
							//change from a non-repeating event to a repeating event
							cautility.updateEvent(req.params.id, qs, req.body, function(err) {
								cautility.createRepeatingEvent(req.params.id, req.body, function(err) {
									conn.end();
									callback(err);
								})
							});
						} else {
							cautility.updateEvent(req.params.id, qs, req.body, function(err) {
								conn.end();
								callback(err);
							});
						}
					}
				})
			})
		}, 
		function(callback) {
			cautility.clearRelationTable(req.body.ca_case_id, msg, function(err) {
				callback(err);
			})
		},
			function(callback) {
				cautility.clearLocationTable(req.body.ca_case_id, msg, function(err) {
					callback(err);
				})
			},
			function(callback) {
			//read results
			pool.getConnection(function(err, conn) {
				conn.query("SELECT ca_event.id AS id, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end, ca_event.rrepeat AS rrepeat, ca_event.rinterval AS rinterval, ca_event.end_after AS end_after, ca_event.rindex AS rindex, ca_event.ca_location_location AS ca_location_location, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_event.id = " + req.params.id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
					conn.end();
					callback(err, results);
				})
			})
	}], 
		function(err, results) {
			if (err) throw err;
			
			var data = {};
			data.id = req.params.id;
			data.eventlist = results;
			data.owner = req.session.username;
			data.updated = new Date();
			data.msg = msg;
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
			//process relation
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relation.id AS id FROM ca_relation JOIN ca_event ON ca_event.ca_relation_id = ca_relation.id WHERE ca_event.id = "' + req.params.id + '" AND ca_event.rindex = ' + req.body.rindex, function(err, results) {
					if (err) throw err;

					if (results.length > 0) {
						var rid = results[0].id;

							cautility.deleteRelation(rid, function(err) {
								if(err) throw err;
								
								conn.end();
								callback(null);
							})
					} else {
						//no existing relations associated with this event, only delete the event
						conn.end();
						callback(null);
					}
				})
			})
		}, function(callback) {
			cautility.deleteEvent(req.params.id, req.body, function(err) {
				callback(null);
			})
		},
		function(callback) {
		//read results
		pool.getConnection(function(err, conn) {
			conn.query("SELECT ca_event.id AS id, ca_event.title AS title, ca_event.start AS start, ca_event.end AS end, ca_event.rrepeat AS rrepeat, ca_event.rinterval AS rinterval, ca_event.end_after AS end_after, ca_event.rindex AS rindex, ca_event.ca_location_location AS ca_location_location, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_event LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_event.id = " + req.params.id + " GROUP BY ca_event.id, ca_event.rindex", function(err, results) {
				conn.end();
				callback(err, results);
			})
		})
}], function(err, results) {
			if (err) throw err;

			var data = {};
			data.id = req.params.id;
			data.eventlist = results;
			data.updated = new Date();
			data.owner = req.session.username;
			res.send(data);
		})
	}
}
