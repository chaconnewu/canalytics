var pool = require('../dbpool.js');
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
	var cols = ['id', 'title', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'ca_calendars_id', 'rindex', 'repeating', 'location'];
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var qs = {};
		Object.keys(req.body).forEach(function(key) {
			if (cols.indexOf(key) > -1) qs[key] = req.body[key];
		});
		async.series({
			createEvent: function(callback) {
				pool.getConnection(function(err, conn) {
					conn.query('INSERT INTO ca_events SET?', qs, function(err, result) {
						conn.end();
						callback(err, result);
					})
				})
			},
			createRelationship: function(callback) {
				if (req.body.relationship && req.body.relationship != 0) {
					pool.getConnection(function(err, conn) {
						conn.query('INSERT INTO ca_relationships SET ?', {
							relationship: req.body.relationship,
							ca_graphs_id: req.body.gid
						}, function(err, result) {
							if (err) throw err;

							var rid = result.insertId;
							var values = '';

							for (var i in req.body.people) {
								values = values + "('" + req.body.people[i] + "', " + rid + "),";
							}
							if (values[values.length - 1] == ",") {
								values = values.slice(0, -1);
							}
							conn.query('INSERT INTO ca_people (name, ca_relationships_id) VALUES ' + values, function(err, result) {
								if (err) throw err;

								var r_insert = [];
								for (var i in req.body.people) {
									var r = {};
									r.id = rid;
									r.name = req.body.people[i];
									r.relationship = req.body.relationship;
									r_insert.push(r);
								}

								conn.query('UPDATE ca_events SET ca_relationships_id = ' + rid + ' WHERE id = "' + req.body.id + '"', function(err, result) {
									if (err) throw err;

									conn.end();
									callback(null, r_insert);
								})
							})
						})
					})
				} else {
					callback(null,null);
				}
			},
			createRepeatingEvent: function(callback) {
				if (req.body.repeating == 1) {
					//create repeating event
					var freq = 0;
					var repeat = parseInt(req.body.rrepeat);
					var interval = req.body.rinterval;
					var end_after = new Date(req.body.end_after);
					var start = new Date(req.body.start);
					var end = new Date(req.body.end);
					var end_after_s = end_after.getTime();
					var start_s = start.getTime();
					var interval_s = 0;
					switch (interval) {
					case 'day':
						interval_s = 86400000;
						break;
					case 'week':
						interval_s = 604800000;
						break;
					case 'month':
						interval_s = 2592000000;
						break;
					}

					freq = Math.ceil((end_after_s - start_s) / (repeat * interval_s));

					var repeat_list = [];
					var j=0;

					for(j=1;j<freq;j++) {
						repeat_list[j-1] = j;
					}
					
					async.eachSeries(repeat_list, function(freq_idx, cb) {
						pool.getConnection(function(err, conn) {
							qs.start = new Date(start.getTime() + repeat * freq_idx * interval_s).toISOString();
							qs.end = new Date(end.getTime() + repeat * freq_idx * interval_s).toISOString();
							conn.query('INSERT INTO ca_events (id, title, start, end, rrepeat, rinterval, end_after, ca_calendars_id, ca_relationships_id, ca_annotations_id, ca_annotations_ca_docs_uuid, rindex, repeating, location) SELECT id, title, "' + qs.start + '", "' + qs.end + '", rrepeat, rinterval, end_after, ca_calendars_id, ca_relationships_id, ca_annotations_id, ca_annotations_ca_docs_uuid, ' + freq_idx + ', repeating, location FROM ca_events WHERE id = "' + req.body.id + '" AND rindex = ' + 0, function(err) {
								if (err) throw err;

								conn.end();
								cb();
							})
						})
					}, function(err) {
						if (err) throw err;
						
						callback(null);
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
			data.r_insert = results.createRelationship;
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
			if (update_list.indexOf(key) > -1) qs[key] = req.body[key];
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
			//compare old relationship with new relationship
			//check whether old relationship exists
			if (results.length > 0) {
				//old relationship exists
				var rid = results[0].id;
				var rel = results[0].relationship;

				//check whether new relationship exists
				if (req.body.relationship && req.body.relationship != '') {
					//new relationship exists
					//check whether the relationship in database is changed
					if (rel == req.body.relationship) {
						//if the old relationship is not changed, update people table only
						pool.getConnection(function(err, conn) {
							conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, results) {
								var people_new = [];
								var people_old = [];
								var insert_list = [];
								var delete_list = [];

								for (var i in results) {
									people_old.push(results[i].name);
								}

								for (var i in req.body.people) {
									people_new.push(req.body.people[i]);
								}

								for (var i = 0; i < people_new.length; i++) {
									var idx = people_old.indexOf(people_new[i]);
									if (idx > -1) {
										people_new.splice(i, 1);
										people_old.splice(idx, 1);
										i--;
									}
								}

								insert_list = people_new;
								delete_list = people_old;

								var r_insert = [];
								for (var i in insert_list) {
									var r = {};
									r.id = rid;
									r.name = insert_list[i];
									r.relationship = rel;
									r_insert.push(r);
								}

								var r_delete = [];
								for (var i in delete_list) {
									var r = {};
									r.id = rid;
									r.name = delete_list[i];
									r.relationship = rel;
									r_delete.push(r);
								}

								if((req.body.repeating == 1) && (req.body.rindex>0)){
									if(insert_list.length > 0 || delete_list.length > 0){
										//if it's a repeating event, and the change doesn't begin from the start, keep the old relationship and people, just create a new relationship and people for the change.
										conn.query('INSERT INTO ca_relationships SET ?', {
											relationship: req.body.relationship,
											ca_graphs_id: req.body.gid
										}, function(err, result){
											if(err) throw err;

											rid = result.insertId;
											qs['ca_relationships_id'] = rid;
											conn.end();
											
											insert_list = [];
											r_insert = [];
											for(var i in req.body.people) {
												insert_list.push(req.body.people[i]);
											}
											for (var i in insert_list) {
												var r = {};
												r.id = rid;
												r.name = insert_list[i];
												r.relationship = rel;
												r_insert.push(r);
											}
											callback(null, rid, insert_list, [], r_insert, []);
										})
									} else {
										conn.end();
										
										callback(null, null, [], [], [], []);
									}
								} else {
									conn.end();
									
									qs['ca_relationships_id'] = rid;
									callback(null, rid, insert_list, delete_list, r_insert, r_delete);
								}
							})
						})
					} else {
						//if the old relationship is changed, delete the old relationship and insert the new relationship, then update people table
						pool.getConnection(function(err, conn) {
							conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, results) {
								var insert_list = [];
console.log('insert_list is');
console.log(req.body.people);

								insert_list = req.body.people;

								var r_delete = [];
								for (var i in results) {
									var r = {};
									r.id = rid;
									r.name = results[i].name;
									r.relationship = rel;
									r_delete.push(r);
								}

								var r_insert = [];
								for (var i in insert_list) {
									var r = {};
									r.id = rid;
									r.name = insert_list[i];
									r.relationship = req.body.relationship;
									r_insert.push(r);
								}
console.log(r_insert);
								if((req.body.repeating == 1) && (req.body.rindex>0)){
									//if it's a repeating event, and the change doesn't begin from the start, keep the old relationship and people, just create a new relationship and people for the change.
									conn.query('INSERT INTO ca_relationships SET ?', {
										relationship: req.body.relationship,
										ca_graphs_id: req.body.gid
									}, function(err, result){
										if(err) throw err;

										rid = result.insertId;
										qs['ca_relationships_id'] = rid;
										
										conn.end();
										callback(null, rid, insert_list, [], r_insert, []);
									})
								} else {
									conn.query('DELETE FROM ca_relationships WHERE id = ' + rid, function(err, results) {
										//insert new relationship
										if (err) throw err;

										conn.query('INSERT INTO ca_relationships SET ?', {
											relationship: req.body.relationship,
											ca_graphs_id: req.body.gid
										}, function(err, result) {
											if (err) throw err;

											rid = result.insertId;
											qs['ca_relationships_id'] = rid;

											conn.end();
											callback(null, rid, insert_list, [], r_insert, r_delete);
										})
									})
								}
							})
						})
					}
				} else {
					//new relationship doesn't exist, delete the old relationship
					pool.getConnection(function(err, conn) {
						conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, results) {
							var delete_list = [];

							for (var i in results) {
								delete_list.push(results[i].name);
							}

							var r_delete = [];
							for (var i in delete_list) {
								var r = {};
								r.id = rid;
								r.name = delete_list[i];
								r.relationship = rel;
								r_delete.push(r);
							}
							
							if((req.body.repeating == 1) && (req.body.rindex>0)){
								//if it's a repeating event, and the change doesn't begin from the start, do nothing
								conn.end();
								
								qs['ca_relationships_id'] = null;
								callback(null, null, [], [], [], []);
							} else {
								conn.query('DELETE FROM ca_relationships WHERE id = ' + rid, function(err, results) {
									if (err) throw err;

									qs['ca_relationships_id'] = null;

									conn.end();
									callback(null, null, null, null, null, r_delete);
								})
							}
						})
					})
				}
			} else {
				//old relationship doesn't exist
				//check whether there is relationship, if there is insert the new relationship, 
				//then update people table
				if (req.body.relationship && req.body.relationship != '') {
					//insert new relationship
					var insert_list = [];

					insert_list = req.body.people;

					var r_insert = [];
					for (var i in insert_list) {
						var r = {};
						r.id = rid;
						r.name = insert_list[i];
						r.relationship = req.body.relationship;
						r_insert.push(r);
					}

					pool.getConnection(function(err, conn) {
						conn.query('INSERT INTO ca_relationships SET ?', {
							relationship: req.body.relationship,
							ca_graphs_id: req.body.gid
						}, function(err, result) {
							if (err) throw err;

							var rid = result.insertId;
							qs['ca_relationships_id'] = rid;

							conn.end();
							callback(null, rid, insert_list, null, r_insert, null);
						})
					});
				} else {
					callback(null, null, null, null, null, null);
				}
			}
		}, 
		function(rid, insert_list, delete_list, r_insert, r_delete, callback) {
			//process new people
			if (insert_list && insert_list.length > 0) {
				var insert_values = '';

				for (var i in insert_list) {
					insert_values += "('" + insert_list[i] + "', " + rid + "),";
				}
				if (insert_values[insert_values.length - 1] == ",") {
					insert_values = insert_values.slice(0, -1);
				}
				console.log('inserting new people');
				console.log('INSERT INTO ca_people (name, ca_relationships_id) VALUES ' + insert_values);
				pool.getConnection(function(err, conn) {
					conn.query('INSERT INTO ca_people (name, ca_relationships_id) VALUES ' + insert_values, function(err, results) {
						if (err) throw err;

						conn.end();
						callback(null, rid, insert_list, delete_list, r_insert, r_delete);
					})
				})
			} else {
				callback(null, rid, insert_list, delete_list, r_insert, r_delete);
			}
		}, 
		function(rid, insert_list, delete_list, r_insert, r_delete, callback) {
			//process old people
			if (delete_list && delete_list.length > 0) {
				delete_values = '(';

				for (var i in delete_list) {
					delete_values += "'" + delete_list[i] + "',";
				}
				if (delete_values[delete_values.length - 1] == ",") {
					delete_values = delete_values.slice(0, -1);
				}
				delete_values += ")";

				pool.getConnection(function(err, conn) {
					conn.query('DELETE FROM ca_people WHERE name IN ' + delete_values + ' AND ca_relationships_id = ' + rid, function(err, results) {
						if (err) throw err;

						conn.end();
						callback(null, r_insert, r_delete);
					})
				})
			} else {
				callback(null, r_insert, r_delete);
			}
		}, 
		function(r_insert, r_delete, callback) {
			//update event
			if (req.body.idx){
				//update a repeating event
				if (req.body.idx.charAt(0) == "x") {
					//update all future events beyond this index
					//update repeating event
					var freq = 0;
					var repeat = parseInt(req.body.rrepeat);
					var interval = req.body.rinterval;
					var end_after = new Date(req.body.end_after);
					var start = new Date(req.body.start);
					var end = new Date(req.body.end);
					var end_after_s = end_after.getTime();
					var start_s = start.getTime();
					var interval_s = 0;
					switch (interval) {
					case 'day':
						interval_s = 86400000;
						break;
					case 'week':
						interval_s = 604800000;
						break;
					case 'month':
						interval_s = 2592000000;
						break;
					}

					freq = Math.ceil((end_after_s - start_s) / (repeat * interval_s));

					var repeat_list = [];

					for (var j=0;j<freq;j++) {
						repeat_list.push(j);
					}
					async.each(repeat_list, function(freq_idx, cb) {
pool.getConnection(function(err, conn){
	qs.start = new Date(start.getTime() + repeat * freq_idx * interval_s).toISOString();
	qs.end = new Date(end.getTime() + repeat * freq_idx * interval_s).toISOString();
							conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '" AND rindex = ' + (parseInt(req.body.rindex)+parseInt(freq_idx)), qs, function(err) {
								if (err) throw err;

								conn.end();
								cb();
							})
							})
					}, function(err) {
						if (err) throw err;

						callback(null, r_insert, r_delete);
					})
				} else {
					//update only this event
					pool.getConnection(function(err, conn) {
						conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '" AND rindex = ' + req.body.rindex, qs, function(err, results) {
							if (err) throw err;

							conn.end();
							callback(null, r_insert, r_delete);
						})
					})
				}
			} else {
				//update a non-repeating event
				pool.getConnection(function(err, conn) {
					conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, function(err, results) {
						if (err) throw err;

						conn.end();
						callback(null, r_insert, r_delete);
					})
				})
			}
		}, 
			function(r_insert, r_delete, callback) {
			//read results
			pool.getConnection(function(err, conn) {
				conn.query("SELECT ca_events.id, ca_events.title, ca_events.start, ca_events.end, ca_events.rrepeat, ca_events.rinterval, ca_events.end_after, ca_events.rindex, ca_events.repeating, ca_events.location, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship FROM ca_events LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_events.id = '" + req.params.id + "' GROUP BY ca_events.id, ca_events.rindex", function(err, results) {
					if(err) throw err;
					
					var data = {};
					data.results = results;
					data.r_insert = r_insert;
					data.r_delete = r_delete;

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
