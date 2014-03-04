var pool = require('../dbpool.js');
var cautility = require('../cautility.js');
var async = require('async');

exports.information = function(req, res) {
	res.send({
		"name": "CAnalytics Store API",
		"version": "1.0.0"
	})
};

exports.findall = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			if (err) {
				throw err;
				conn.end();
			} else {
				conn.query("SELECT ca_annotation.id AS id, ca_annotation.text AS text, ca_annotation.quote AS quote, ca_annotation.range_start AS range_start, ca_annotation.range_end AS range_end, ca_annotation.startOffset AS startOffset, ca_annotation.endOffset AS endOffset, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.rrepeat AS rrepeat, ca_annotation.rinterval AS rinterval, ca_annotation.end_after AS end_after, ca_annotation.ca_location_location AS ca_location_location, ca_annotation.ca_doc_uuid AS ca_doc_uuid, ca_annotation.ca_case_id AS ca_case_id, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id", function(err, results) {
					var annotation_list = [];

					if (err) throw err;
					if (results.length > 0) {
						annotation_list = results;
					}

					annotation_list.forEach(function(annotation) {
						annotation.ranges = [];
						annotation.ranges[0] = {
							start: annotation.range_start,
							startOffset: annotation.startOffset,
							end: annotation.range_end,
							endOffset: annotation.endOffset
						};
						if (annotation.people) {
							annotation.people = annotation.people.split(",")
						}
						//annotation.tags = annotation.tags.split(",")
					})

					conn.end();
					res.send(annotation_list);
				})
			}
		});
	}
};

exports.search = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			if (err) {
				throw err;
				conn.end();
			} else {
				var docid, limit, offset, q;

				q = "SELECT ca_annotation.id AS id, ca_annotation.text AS text, ca_annotation.quote AS quote, ca_annotation.range_start AS range_start, ca_annotation.range_end AS range_end, ca_annotation.startOffset AS startOffset, ca_annotation.endOffset AS endOffset, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.rrepeat AS rrepeat, ca_annotation.rinterval AS rinterval, ca_annotation.end_after AS end_after, ca_annotation.ca_location_location AS ca_location_location, ca_annotation.ca_doc_uuid AS ca_doc_uuid, ca_annotation.ca_case_id AS ca_case_id, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id";
				docid = (req.query['ca_doc_uuid'] != null) ? req.query['ca_doc_uuid'] : '*';
				limit = (req.query['limit'] != null) ? req.query['limit'] : 999999999999999999;
				offset = (req.query['offset'] != null) ? req.query['offset'] : 0;

				if (req.query['ca_doc_uuid'] != null) {
					q = q + " WHERE ca_doc_uuid = '" + docid + "'"
				}

				q += " GROUP BY id"

				if (limit != null && offset == null) {
					q = q + " LIMIT " + limit
				}

				if (limit != null && offset != null) {
					q = q + " LIMIT " + limit + " OFFSET " + offset
				}

				conn.query(q, function(err, results) {
					var annotation_list = [],
						annotation;

					if (err) throw err;
					if (results.length > 0) {
						annotation_list = results;
					}

					annotation_list.forEach(function(annotation) {
						annotation.ranges = [];
						annotation.ranges[0] = {
							start: annotation.range_start,
							startOffset: annotation.startOffset,
							end: annotation.range_end,
							endOffset: annotation.endOffset
						};
						if (annotation.people) {
							annotation.people = annotation.people.split(",")
						}
						//annotation.tags = annotation.tags.split(",")
					})

					conn.end();

					res.send({
						"total": annotation_list.length,
						"rows": annotation_list
					});
				})
			}
		});
	}
};

exports.create = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var cols = ['text', 'quote', 'ca_location_location', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'ca_doc_uuid', 'ca_case_id'];
		var qs = {};
		Object.keys(req.body).forEach(function(key) {
			if (cols.indexOf(key) > -1) {
				if (req.body[key] != '') {
					qs[key] = req.body[key];
				}
			}
		});
		qs['range_start'] = req.body.ranges[0].start;
		qs['range_end'] = req.body.ranges[0].end;
		qs['startOffset'] = req.body.ranges[0].startOffset;
		qs['endOffset'] = req.body.ranges[0].endOffset;

		//the message array carries information about what has been added/deleted/updated during the process of creat, update, and delete. Each message takes the following form,
		// msg = [{operation:create[delete][update], resource:annotation[event][relation], id:id},[...],...]
		var msg = [];
		
		async.waterfall([

		function(callback) {
			pool.getConnection(function(err, conn) {
				conn.query('INSERT INTO ca_annotation SET ?', qs, function(err, result) {
					conn.end();
					callback(err, result.insertId);
				})
			})
		}, function(id, callback) {
			if (req.body.relation && req.body.relation != '') {
				cautility.createRelation(req.body.people, req.body.relation, req.body.ca_case_id, function(rid) {
					pool.getConnection(function(err, conn) {
						conn.query('UPDATE ca_annotation SET ca_relation_id = ' + rid + ' WHERE id = ' + id, function(err, result) {
							if (err) throw err;

							msg.push({
								operation: 'create',
								resource: 'relation',
								id: rid,
								updated: new Date()
							});
							conn.end();
							callback(null, id, rid);
						})
					})
				})
			} else {
				callback(null, id, null);
			}
		}, function(id, rid, callback) {
			if (req.body.start) {
				var data = {
					title: req.body.text,
					start: req.body.start,
					end: req.body.end,
					rrepeat: req.body.rrepeat,
					rinterval: req.body.rinterval,
					end_after: req.body.end_after,
					rindex: 0,
					ca_case_id: req.body.ca_case_id,
					ca_location_location: req.body.ca_location_location,
					ca_annotation_id: id,
					ca_relation_id: rid
				};

				cautility.createEvent(data, function(eid) {
					msg.push({
						operation: 'create',
						resource: 'event',
						id: eid,
						updated: new Date()
					})
					callback(null, id, eid, data);
				});
			} else {
				callback(null, id, null, null);
			}
		}, function(id, eid, data, callback) {
			if (req.body.rrepeat) {
				cautility.createRepeatingEvent(eid, data, function(err) {
					callback(err, id);
				})
			} else {
				callback(null, id);
			}
		}, function(id, callback) {
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_annotation.id AS id, ca_annotation.text AS text, ca_annotation.quote AS quote, ca_annotation.range_start AS range_start, ca_annotation.range_end AS range_end, ca_annotation.startOffset AS startOffset, ca_annotation.endOffset AS endOffset, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.rrepeat AS rrepeat, ca_annotation.rinterval AS rinterval, ca_annotation.end_after AS end_after, ca_annotation.ca_location_location AS ca_location_location, ca_annotation.ca_doc_uuid AS ca_doc_uuid, ca_annotation.ca_case_id AS ca_case_id, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_annotation.id = ' + id, function(err, results) {
					if(err) throw err;
					
					conn.end();
					callback(null, id, results);
				})
			})
		}], function(err, id, results) {
			if (err) throw err;
			var data = {};
			data.id = id;
			data.results = results;
			data.msg = msg;
			data.updated = new Date();
			data.owner = req.session.username;
			res.send(data);
		});
	}
};

exports.update = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var cols = ['text', 'ca_location_location', 'start', 'end', 'rrepeat', 'rinterval', 'end_after'];
		var qs = {};
		Object.keys(req.body).forEach(function(key) {
			if (cols.indexOf(key) > -1) {
				if (req.body[key] != '') {
					qs[key] = req.body[key];
				}
			}
		});
		
		//the message array carries information about what has been added/deleted/updated during the process of creat, update, and delete. Each message takes the following form,
		// msg = [{operation:create[delete][update], resource:annotation[event][relation], id:id},[...],...]
		var msg = [];

		async.waterfall([
		//'start', 'end', 'rrepeat', 'rinterval', 'end_after'
		function(callback) {
			//search old relationship
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relation.id AS id, ca_relation.relation AS relation FROM ca_relation JOIN ca_annotation ON ca_annotation.ca_relation_id = ca_relation.id WHERE ca_annotation.id = ' + req.params.id, function(err, results) {
					if (err) throw err;

					conn.end();
					callback(null, results);
				})
			})
		}, function(results, callback) {
			var rid = null;
			var relation = null;
			if (results.length > 0) {
				rid = results[0].id;
				relation = results[0].relation;
			}
			cautility.compareRelation(rid, relation, req.body.relation, req.body.people, req.body.rrepeat, 0, req.body.ca_case_id, msg, function(err, rid, insert_list, delete_list) {
				callback(null, rid, insert_list, delete_list);
			})
		}, function(rid, insert_list, delete_list, callback) {
			cautility.createPeople(rid, insert_list, function(err) {
				callback(err, rid, delete_list);
			})
		}, function(rid, delete_list, callback) {
			cautility.deletePeople(rid, delete_list, function(err) {
				callback(err, rid);
			})
		}, function(rid, callback) {
			qs.ca_relation_id = rid;
			pool.getConnection(function(err, conn) {
				conn.query('UPDATE ca_annotation SET ? WHERE id = ' + req.params.id, qs, function(err, results) {
					if (err) throw err;

					conn.end();
					callback(null, rid);
				})
			})
		}, function(rid, callback) {
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_event.id AS eid, ca_event.rrepeat AS rrepeat FROM ca_event JOIN ca_annotation ON ca_event.ca_annotation_id = ca_annotation.id WHERE ca_annotation.id = ' + req.params.id, function(err, results) {
					if (err) throw err;
					var eid;
					var rrepeat;

					if (results.length > 0) {
						eid = results[0].eid;
					}

					conn.end();
					callback(null, rid, eid, rrepeat);
				})
			})
		},
		function(rid, eid, rrepeat, callback) {
			if(eid) {
				//There is an event associated with the annotation
						if (req.body.start) {
							//The event just need to be updated
							var data = {
								title: req.body.text,
								start: req.body.start,
								end: req.body.end,
								rrepeat: req.body.rrepeat,
								rinterval: req.body.rinterval,
								end_after: req.body.end_after,
								ca_location_location: req.body.ca_location_location,
								ca_annotation_id: req.params.id,
								ca_relation_id: rid
							};

							var querystring = {};
							var update_list = ['title', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'ca_location_location'];

							Object.keys(data).forEach(function(key) {
								if (update_list.indexOf(key) > -1) {
									if (data[key] != '') {
										querystring[key] = data[key];
									}
								}
							})

							if(rrepeat){
								//the event is a repeating event
								if(req.body.rrepeat) {
									//update the repeating event
									//the event is a repeating event
									data.idx = 'x0';
									cautility.updateEvent(eid, querystring, data, function(err) {
										msg.push({
											operation: 'update',
											resource: 'event',
											id: eid,
											updated: new Date()
										});
										callback(err, rid, eid);
									});
								} else {
									//change the event to a non-repeating event
									cautility.deleteEvent(eid, {idx: 'x1'}, function(err) {
										msg.push({
											operation: 'update',
											resource: 'event',
											id: eid,
											updated: new Date()
										});
										callback(err, rid, eid);
									})
								}
							} else {
								//the event is a non-repeating event
								if(req.body.rrepeat) {
									//change the event to a repeating event
									cautility.updateEvent(eid, querystring, data, function(err) {
										cautility.createRepeatingEvent(eid, data, function(err) {
											msg.push({
												operation: 'update',
												resource: 'event',
												id: eid,
												updated: new Date()
											});
											callback(err, rid, eid);
										})
									})
								} else {
									//update the non-repeating event
									cautility.updateEvent(eid, querystring, data, function(err) {
										msg.push({
											operation: 'update',
											resource: 'event',
											id: eid,
											updated: new Date()
										});
										callback(err, rid, eid);
									})
								}
							}
						} else {
							//need to delete the event
							cautility.deleteEvent(eid, {}, function() {
								msg.push({
									operation: 'delete',
									resource: 'event',
									id: eid,
									updated: new Date()
								});
								callback(null, rid, eid);
							})
						}
			} else {
				//No event is associated with the annotation
				if(req.body.start) {
					//need to create an event
					var data = {
						title: req.body.text,
						start: req.body.start,
						end: req.body.end,
						rrepeat: req.body.rrepeat,
						rinterval: req.body.rinterval,
						end_after: req.body.end_after,
						ca_location_location: req.body.ca_location_location,
						ca_annotation_id: req.params.id,
						ca_relation_id: rid
					};
					data.rindex = 0;
					data.ca_case_id = req.body.ca_case_id;
					cautility.createEvent(data, function(eid) {
						msg.push({
							operation: 'create',
							resource: 'event',
							id: eid,
							updated: new Date()
						});
						callback(null, eid, data);
					});
				} else {
					callback(null, eid, data);
				}
			}
		}, function(eid, data, callback) {
			if (req.body.rrepeat) {
				cautility.createRepeatingEvent(eid, data, function(err) {
					callback(err);
				})
			} else {
				callback(null);
			}
		}, function(callback) {
			cautility.clearRelationTable(req.body.ca_case_id, msg, function(err) {
				callback(err);
			})
		}, function(callback) {
			cautility.clearLocationTable(req.body.ca_case_id, msg, function(err) {
				callback(err);
			})
		}, 	function(callback) {
				pool.getConnection(function(err, conn) {
					conn.query('SELECT ca_annotation.id AS id, ca_annotation.text AS text, ca_annotation.quote AS quote, ca_annotation.range_start AS range_start, ca_annotation.range_end AS range_end, ca_annotation.startOffset AS startOffset, ca_annotation.endOffset AS endOffset, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.rrepeat AS rrepeat, ca_annotation.rinterval AS rinterval, ca_annotation.end_after AS end_after, ca_annotation.ca_location_location AS ca_location_location, ca_annotation.ca_doc_uuid AS ca_doc_uuid, ca_annotation.ca_case_id AS ca_case_id, GROUP_CONCAT(ca_person.name) as people, ca_relation.relation AS relation FROM ca_annotation LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id WHERE ca_annotation.id = ' + req.params.id, function(err, results) {
						if(err) throw err;

						conn.end();
						callback(null, results);
					})
				})
			}], function(err, results) {
			if (err) throw err;

			var data = {}
			data.id = req.params.id;
			data.updated = new Date();
			data.msg = msg;
			data.owner = req.session.username;
			data.results = results;
			res.send(data);
		});
	}
};

exports.delete = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var msg = [];

		async.waterfall([

		function(callback) {
			//process relation
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relation.id AS id FROM ca_relation JOIN ca_annotation ON ca_annotation.ca_relation_id = ca_relation.id WHERE ca_annotation.id = ' + req.params.id, function(err, results) {
					if (err) console.log(err);

					if (results.length > 0) {
						var rid = results[0].id;

						cautility.deleteRelation(rid, function(err) {
							if (err) throw err;

							msg.push({
								operation: 'delete',
								resource: 'relation',
								id: rid,
								updated: new Date()
							});
							
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
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_event.id AS eid FROM ca_event JOIN ca_annotation ON ca_event.ca_annotation_id = ca_annotation.id WHERE ca_annotation.id = ' + req.params.id, function(err, results) {
					if(err) console.log(err);
					
					if(results.length > 0) {
						var eid = results[0].eid;
						
						msg.push({
							operation: 'delete',
							resource: 'event',
							id: eid,
							updated: new Date()
						});	
						
						conn.end();
						callback(null);	
					} else {
						conn.end();
						callback(null);
					}
				})
			})
		}, function(callback) {
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_doc_uuid FROM ca_annotation WHERE id = ' + req.params.id, function(err, result) {
					if(err) console.log(err);
					
					conn.end();
					callback(null, result[0].ca_doc_uuid);
				})
			})
		}, function(ca_doc_uuid, callback) {
			pool.getConnection(function(err, conn) {
				conn.query('DELETE FROM ca_annotation WHERE id = ' + req.params.id, function(err, result) {
					if (err) console.log(err);
					
					conn.end();
					callback(null, ca_doc_uuid);
				})
			})
		}		, 	function(ca_doc_uuid, callback) {
						cautility.clearRelationTable(req.body.ca_case_id, msg, function(err) {
							callback(err, ca_doc_uuid);
						})
					}, function(ca_doc_uuid, callback) {
						cautility.clearLocationTable(req.body.ca_case_id, msg, function(err) {
							callback(err, ca_doc_uuid);
						})
					}
		], function(err, ca_doc_uuid) {
			if (err) console.log(err);

			var data = {};
			data.id = req.body.id;
			data.ca_doc_uuid = ca_doc_uuid;
			data.msg = msg;
			data.owner = req.session.username;
			data.updated = new Date();
			res.send(data);
		})
	}
};
