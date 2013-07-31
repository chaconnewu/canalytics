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
				conn.query("SELECT ca_annotations.id AS id, ca_annotations.text AS text, ca_annotations.quote AS quote, ca_annotations.range_start AS range_start, ca_annotations.range_end AS range_end, ca_annotations.startOffset AS startOffset, ca_annotations.endOffset AS endOffset, ca_annotations.location AS location, ca_annotations.start AS start, ca_annotations.end AS end, ca_annotations.ca_docs_uuid AS docid, ca_annotations.rrepeat AS rrepeat, ca_annotations.rinterval AS rinterval, ca_annotations.end_after AS end_after, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship AS relation FROM ca_annotations LEFT JOIN ca_relationships ON ca_annotations.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id", function(err, results) {
					var annotation_list = [];

					if (err) throw err;
					if (results.length > 0) {
						annotation_list = results;
					}

					annotation_list.forEach(function(annotation) {
						annotation.docid = annotation.ca_docs_uuid;
						annotation.ranges = [];
						annotation.ranges[0] = {
							start: annotation.range_start,
							startOffset: annotation.startOffset,
							end: annotation.range_end,
							endOffset: annotation.endOffset
						};
						if(annotation.people) {
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

				q = "SELECT ca_annotations.id AS id, ca_annotations.text AS text, ca_annotations.quote AS quote, ca_annotations.range_start AS range_start, ca_annotations.range_end AS range_end, ca_annotations.startOffset AS startOffset, ca_annotations.endOffset AS endOffset, ca_annotations.location AS location, ca_annotations.start AS start, ca_annotations.end AS end, ca_annotations.ca_docs_uuid AS docid, ca_annotations.rrepeat AS rrepeat, ca_annotations.rinterval AS rinterval, ca_annotations.end_after AS end_after, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship AS relation FROM ca_annotations LEFT JOIN ca_relationships ON ca_annotations.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id";
				docid = (req.query['docid'] != null) ? req.query['docid'] : '*';
				limit = (req.query['limit'] != null) ? req.query['limit'] : 999999999999999999;
				offset = (req.query['offset'] != null) ? req.query['offset'] : 0;

				if (req.query['docid'] != null) {
					q = q + " WHERE ca_docs_uuid = '" + docid + "'"
				}

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
						if(annotation.people) {
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
		var cols = ['text', 'quote', 'location', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'ca_docs_uuid'];
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
		qs['ca_docs_uuid'] = req.body.docid;

		async.waterfall([

		function(callback) {
			pool.getConnection(function(err, conn) {
				conn.query('INSERT INTO ca_annotations SET ?', qs, function(err, result) {
					conn.end();
					callback(err, result.insertId);
				})
			})
		}, function(id, callback) {
			if (req.body.relation && req.body.relation != '') {
				cautility.createRelation(req.body.people, req.body.relation, req.body.gid, function(rid) {
					pool.getConnection(function(err, conn) {
						conn.query('UPDATE ca_annotations SET ca_relationships_id = ' + rid + ' WHERE id = "' + id + '"', function(err, result) {
							if (err) throw err;

							conn.end();
							callback(null, id, rid);
						})
					})
				})
			} else {
				callback(null, id, null);
			}
		}, function(id, rid, callback) {
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_calendars.id FROM ca_calendars JOIN ca_cases ON ca_calendars.ca_cases_id = ca_cases.id JOIN ca_docs ON ca_cases.id = ca_docs.ca_cases_id JOIN ca_annotations ON ca_docs.uuid = ca_annotations.ca_docs_uuid WHERE ca_annotations.id = ' + id, function(err, result) {
					if(err) throw err;
					
					conn.end();
					callback(null, id, rid, result[0].id);
				})
			})
		}, function(id, rid, cid, callback) {
			if (req.body.start) {
				var data = {
					id: generateId(),
					title: req.body.text,
					start: req.body.start,
					end: req.body.end,
					rrepeat: req.body.rrepeat,
					rinterval: req.body.rinterval,
					end_after: req.body.end_after,
					ca_calendars_id: cid,
					rindex: 0,
					repeating: (req.body.rrepeat) ? 1:0,
					location: req.body.location
				};

				cautility.createEvent(data, function(err) {
					callback(err, id, data);
				});
			} else {
				callback(null, id, null);
			}
		}, function(id, data, callback) {
			if (req.body.rrepeat === '1') {
				cautility.createRepeatingEvent(data, function(err) {
					callback(err, id);
				})
			} else {
				callback(null, id);
			}
		}], function(err, id) {
			if (err) throw err;
			var data = {};
			data.id = id;
			res.send(data);
		});
	}
};

exports.update = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var cols = ['text', 'location'];
		var qs = {};
		Object.keys(req.body).forEach(function(key) {
			if (cols.indexOf(key) > -1) {
				if (req.body[key] != '') {
					qs[key] = req.body[key];
				}
			}
		});
		
		async.waterfall([
//'start', 'end', 'rrepeat', 'rinterval', 'end_after'
		function(callback) {
			//search old relationship
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_relationships.id AS id, ca_relationships.relationship AS relationship FROM ca_relationships JOIN ca_annotations ON ca_annotations.ca_relationships_id = ca_relationships.id WHERE ca_annotations.id = "' + req.params.id + '"', function(err, results) {
					if (err) throw err;

					conn.end();
					callback(null, results);
				})
			})
		}, function(id, callback) {
			if (req.body.relation && req.body.relation != '') {
				cautility.createRelation(req.body.people, req.body.relation, req.body.gid, function(rid) {
					pool.getConnection(function(err, conn) {
						conn.query('UPDATE ca_annotations SET ca_relationships_id = ' + rid + ' WHERE id = "' + id + '"', function(err, result) {
							if (err) throw err;

							conn.end();
							callback(null, id, rid);
						})
					})
				})
			} else {
				callback(null, id, null);
			}
		}, function(id, rid, callback) {
			pool.getConnection(function(err, conn) {
				conn.query('SELECT ca_calendars.id FROM ca_calendars JOIN ca_cases ON ca_calendars.ca_cases_id = ca_cases.id JOIN ca_docs ON ca_cases.id = ca_docs.ca_cases_id JOIN ca_annotations ON ca_docs.uuid = ca_annotations.ca_docs_uuid WHERE ca_annotations.id = ' + id, function(err, result) {
					if(err) throw err;
					
					conn.end();
					callback(null, id, rid, result[0].id);
				})
			})
		}, function(id, rid, cid, callback) {
			if (req.body.start) {
				var data = {
					id: generateId(),
					title: req.body.text,
					start: req.body.start,
					end: req.body.end,
					rrepeat: req.body.rrepeat,
					rinterval: req.body.rinterval,
					end_after: req.body.end_after,
					ca_calendars_id: cid,
					rindex: 0,
					repeating: (req.body.rrepeat) ? 1:0,
					location: req.body.location
				};

				cautility.createEvent(data, function(err) {
					callback(err, id, data);
				});
			} else {
				callback(null, id, null);
			}
		}, function(id, data, callback) {
			if (req.body.rrepeat === '1') {
				cautility.createRepeatingEvent(data, function(err) {
					callback(err, id);
				})
			} else {
				callback(null, id);
			}
		}], function(err, id) {
			if (err) throw err;
			var data = {};
			data.id = id;
			res.send(data);
		});
	}
};

exports.delete = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			if (err) {
				throw err;
				conn.end();
			} else {
				var query = conn.query('DELETE FROM ca_annotations WHERE id = ' + req.params.id, function(err, result) {
					if (err) throw err;
					conn.end();
					res.send();
				});
			}
		});
	}
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
