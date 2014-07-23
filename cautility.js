var pool = require('./dbpool.js');
var async = require('async');

exports.createRelation = function(people, relation, cid, callback) {
			pool.getConnection(function(err, conn) {
				conn.query('INSERT INTO ca_relation SET ?', {
					relation: relation,
					ca_case_id: cid,
					updated: new Date()
				}, function(err, result) {
					if (err) {
                        console.log('Create people relation failed: ' + err);
                        throw err;
                    }

					var rid = result.insertId;
					var values = '';

					if (typeof people === 'string') {
						people = [ people ];
					}

					for (var i in people) {
						values = values + "('" + people[i] + "', " + rid + "),";
					}
					if (values[values.length - 1] == ",") {
						values = values.slice(0, -1);
					}
					conn.query('INSERT INTO ca_person (name, ca_relation_id) VALUES ' + values, function(err, result) {
						if (err) throw err;


						conn.end();
						callback(rid);
					})
				})
			})
};


exports.deleteRelation = function(rid, callback) {
	pool.getConnection(function(err, conn) {
		conn.query('DELETE FROM ca_relation WHERE id = ' + rid, function(err, result) {
			if (err) throw err;


			conn.end();
			callback(null);
		})
	})
}

exports.createEvent = function(data, callback) {
	var qs = {};
	var cols = ['title', 'start', 'end', 'rrepeat', 'rinterval', 'end_after', 'rindex', 'ca_case_id', 'ca_location_location', 'ca_annotation_id', 'ca_relation_id', 'creator', 'editors', 'color'];

	Object.keys(data).forEach(function(key) {
		if (cols.indexOf(key) > -1) {
			if (data[key] != '') {
				qs[key] = data[key];
			}
		}
	});

	pool.getConnection(function(err, conn) {
		conn.query('INSERT INTO ca_event SET ?', qs, function(err, result) {
			if (err) throw err;

			var newid = result.insertId;
			conn.end();
			callback(newid);
		})
	})
};

exports.deleteEvent = function(id, data, msg, callback) {
	//process event
	if (data.idx) {
		//delete a repeating event
		if (data.idx.charAt(0) == "x") {

			//delete all future events beyond this index
			var idx = data.idx.substring(1);

			pool.getConnection(function(err, conn) {
				conn.query('DELETE FROM ca_event WHERE id = ' + id + ' AND rindex >= ' + idx, function(err, result) {
					if (err) throw err;
					//change the end_after date to the end date of the last repeating event
					conn.query('SELECT * FROM ca_event WHERE id = ' + id, function(err, results) {
						if(err) throw err;

						if(results.length > 0) {
							var newend = results[results.length-1].end;
							conn.query('UPDATE ca_event SET end_after = "' + newend + '" WHERE id = ' + id, function(err, result) {
								conn.end();
								msg.push({
									operation: 'update',
									resource: 'event',
									id: id,
									updated: new Date()
								})
								callback(null);
							})
						} else {
							conn.end();

							msg.push({
								operation: 'delete',
								resource: 'event',
								id: id,
								updated: new Date()
							})

							callback(null);
						}
					})
				})
			})
		} else {
			//only delete this event
			pool.getConnection(function(err, conn) {
				conn.query('DELETE FROM ca_event WHERE id = ' + id + ' AND rindex = ' + data.idx, function(err, result) {
					if (err) throw err;

					//change the end_after date to the end date of the last repeating event
					conn.query('SELECT * FROM ca_event WHERE id = ' + id, function(err, results) {
						if(err) throw err;


						if(results.length > 0) {
							var newend = results[results.length-1].end;
							conn.query('UPDATE ca_event SET end_after = "' + newend + '" WHERE id = ' + id, function(err, result) {
								conn.end();
								msg.push({
									operation: 'update',
									resource: 'event',
									id: id,
									updated: new Date()
								})
								callback(null);
							})
						} else {
							conn.end();
							msg.push({
								operation: 'delete',
								resource: 'event',
								id: id,
								updated: new Date()
							})
							callback(null);
						}
					})
				})
			})
		}
	} else {
		//delete a non-repeating event that has the id or delete a repeating event completely
		pool.getConnection(function(err, conn) {
			conn.query('DELETE FROM ca_event WHERE id = ' + id, function(err, result) {
				if (err) throw err;

				msg.push({
					operation: 'delete',
					resource: 'event',
					id: id,
					updated: new Date()
				})

				conn.end();
				callback(null);
			})
		})
	}
};

exports.createRepeatingEvent = function(id, data, callback) {
		//create repeating event
		var freq = 0;
		var repeat = parseInt(data.rrepeat);
		var interval = data.rinterval;
		var end_after = new Date(data.end_after);
		var start = new Date(data.start);
		var end = new Date(data.end);
		var end_after_s = end_after.getTime();
		var start_s = start.getTime();
		var interval_s = 0;
		switch (interval) {
		case 'day(s)':
			interval_s = 86400000;
			break;
		case 'week(s)':
			interval_s = 604800000;
			break;
		case 'month(s)':
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
				newstart = new Date(start.getTime() + repeat * freq_idx * interval_s).toISOString();
				newend = new Date(end.getTime() + repeat * freq_idx * interval_s).toISOString();
				newstart = newstart.split(':');
				newstart = newstart[0]+':'+newstart[1];
				newend = newend.split(':');
				newend = newend[0]+':'+newend[1];
				conn.query('INSERT INTO ca_event (id, title, start, end, rrepeat, rinterval, end_after, rindex, ca_case_id, ca_location_location, ca_annotation_id, ca_relation_id) SELECT id, title, "' + newstart + '", "' + newend + '", rrepeat, rinterval, end_after, ' + freq_idx + ', ca_case_id, ca_location_location, ca_annotation_id, ca_relation_id FROM ca_event WHERE id = ' + id + ' AND rindex = ' + 0, function(err) {
					if (err) throw err;

					conn.end();
					cb();
				})
			})
		}, function(err) {
			if (err) throw err;

			callback(null);
		})
};

exports.compareRelation = function(oldrelation_id, oldrelation, newrelation, newpeople, rrepeat, rindex, cid, msg, callback) {
	if (typeof newpeople === 'string') {
		newpeople = [ newpeople ];
	}
	//compare old relation with new relationship
			if(oldrelation_id) {
				//old relationship exists
		//check whether new relationship exists
		if (newrelation && newrelation != '') {
			//new relationship exists
			//check whether the relationship in database is changed
			if (oldrelation == newrelation) {
				//if the old relationship is not changed, update people table only
				pool.getConnection(function(err, conn) {
					conn.query('SELECT name FROM ca_person WHERE ca_relation_id = ' + oldrelation_id, function(err, results) {
						var people_new = [];
						var people_old = [];

						for (var i in results) {
							people_old.push(results[i].name);
						}

						for (var i in newpeople) {
							people_new.push(newpeople[i]);
						}

						for (var i = 0; i < people_new.length; i++) {
							var idx = people_old.indexOf(people_new[i]);
							if (idx > -1) {
								people_new.splice(i, 1);
								people_old.splice(idx, 1);
								i--;
							}
						}

						if((rrepeat) && (parseInt(rrepeat) > 0) && (rindex>0)){
							//if it's a repeating event, and the change doesn't begin from the start, keep the old relationship and people, just create a new relationship and people for the change.
							if(people_new.length > 0 || people_old.length > 0){
								conn.query('INSERT INTO ca_relation SET ?', {
									relation: newrelation,
									ca_case_id: cid
								}, function(err, result){
									if(err) throw err;

									var rid = result.insertId;

									msg.push({
										operation: 'create',
										resource: 'relation',
										id: rid,
										updated: new Date()
									});

									conn.end();

									callback(null, rid, people_new, []);
								})
							} else {
								conn.end();

								callback(null, null, people_new, people_old);
							}
						} else {
							conn.end();

							if(people_new.length > 0 || people_old.length > 0){
								msg.push({
									operation: 'update',
									resource: 'relation',
									id: oldrelation_id,
									updated: new Date()
								});
							}

							callback(null, oldrelation_id, people_new, people_old);
						}
					})
				})
			} else {
				//if the old relationship is changed, delete the old relationship and insert the new relationship, then update people table
				pool.getConnection(function(err, conn) {
					conn.query('SELECT name FROM ca_person WHERE ca_relation_id = ' + oldrelation_id, function(err, results) {
						if((rrepeat) && (parseInt(rrepeat) > 0) && (rindex>0)){
							//if it's a repeating event, and the change doesn't begin from the start, keep the old relationship and people, just create a new relationship and people for the change.
							conn.query('INSERT INTO ca_relation SET ?', {
								relation: newrelation,
								ca_case_id: cid
							}, function(err, result){
								if(err) throw err;

								var rid = result.insertId;

								msg.push({
									operation: 'create',
									resource: 'relation',
									id: rid,
									updated: new Date()
								});

								conn.end();
								callback(null, rid, newpeople, []);
							})
						} else {
							conn.query('DELETE FROM ca_relation WHERE id = ' + oldrelation_id, function(err, results) {
								//insert new relationship
								if (err) throw err;

								msg.push({
									operation: 'delete',
									resource: 'relation',
									id: oldrelation_id,
									updated: new Date()
								});

								conn.query('INSERT INTO ca_relation SET ?', {
									relation: newrelation,
									ca_case_id: cid
								}, function(err, result) {
									if (err) throw err;

									var rid = result.insertId;

									msg.push({
										operation: 'create',
										resource: 'relation',
										id: rid,
										updated: new Date()
									});

									conn.end();
									callback(null, rid, newpeople, []);
								})
							})
						}
					})
				})
			}
		} else {
			//new relationship doesn't exist, delete the old relationship
			pool.getConnection(function(err, conn) {
				conn.query('SELECT name FROM ca_person WHERE ca_relation_id = ' + oldrelation_id, function(err, results) {
					if((rrepeat) && (parseInt(rrepeat) > 0) && (rindex>0)){
						//if it's a repeating event, and the change doesn't begin from the start, do nothing
						conn.end();

						callback(null, null, [], []);
					} else {
						conn.query('DELETE FROM ca_relation WHERE id = ' + oldrelation_id, function(err, results) {
							if (err) throw err;

							msg.push({
								operation: 'delete',
								resource: 'relation',
								id: oldrelation_id,
								updated: new Date()
							});

							conn.end();
							callback(null, null, null, null);
						})
					}
				})
			})
		}
	} else {
		//old relationship doesn't exist
		//check whether there is relationship, if there is insert the new relationship,
		//then update people table
		if (newrelation && newrelation != '') {
			//insert new relationship
			pool.getConnection(function(err, conn) {
				conn.query('INSERT INTO ca_relation SET ?', {
					relation: newrelation,
					ca_case_id: cid
				}, function(err, result) {
					if (err) throw err;

					var rid = result.insertId;

					msg.push({
						operation: 'create',
						resource: 'relation',
						id: rid,
						updated: new Date()
					});

					conn.end();
					callback(null, rid, newpeople, null, msg);
				})
			});
		} else {
			callback(null, null, null, null, msg);
		}
	}
};

exports.createPeople = function(rid, insert_list, callback) {
	//process new people
	if (insert_list && insert_list.length > 0) {
		var insert_values = '';

		for (var i in insert_list) {
			insert_values += "('" + insert_list[i] + "', " + rid + "),";
		}
		if (insert_values[insert_values.length - 1] == ",") {
			insert_values = insert_values.slice(0, -1);
		}

		pool.getConnection(function(err, conn) {
			conn.query('INSERT INTO ca_person (name, ca_relation_id) VALUES ' + insert_values, function(err, results) {
				if (err) throw err;

				conn.end();
				callback(err);
			})
		})
	} else {
		callback(null);
	}
};

exports.deletePeople = function(rid, delete_list, callback) {
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
			conn.query('DELETE FROM ca_person WHERE name IN ' + delete_values + ' AND ca_relation_id = ' + rid, function(err, results) {
				if (err) throw err;

				conn.end();
				callback(err);
			})
		})
	} else {
		callback(null);
	}
};

exports.updateEvent = function(id, qs, data, callback) {
				//update event
				console.log(data);
				if (data.idx){
					//update a repeating event
					if(data.rrepeat && parseInt(data.rrepeat)>0 && data.rinterval && data.end_after && data.start && data.end) {
					if (data.idx.charAt(0) == "x") {
						//update all future events beyond this index
						//update repeating event
						data.idx = data.idx.substring(1);
						var freq = 0;
						var repeat = parseInt(data.rrepeat);
						var interval = data.rinterval;
						var end_after = new Date(data.end_after);
						var start = new Date(data.start);
						var end = new Date(data.end);
						var end_after_s = end_after.getTime();
						var start_s = start.getTime();
						var interval_s = 0;
						switch (interval) {
						case 'day(s)':
							interval_s = 86400000;
							break;
						case 'week(s)':
							interval_s = 604800000;
							break;
						case 'month(s)':
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
								conn.query('UPDATE ca_event SET ? WHERE id = "' + id + '" AND rindex = ' + (parseInt(data.idx)+parseInt(freq_idx)), qs, function(err) {
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
						//update only this event
						pool.getConnection(function(err, conn) {
							conn.query('UPDATE ca_event SET ? WHERE id = "' + id + '" AND rindex = ' + parseInt(data.idx), qs, function(err, results) {
								if (err) throw err;

								conn.end();
								callback(null);
							})
						})
					}
				} else {
					pool.getConnection(function(err, conn) {
						conn.query('UPDATE ca_event SET ? WHERE id = "' + id + '"', qs, function(err, results) {
							if (err) throw err;

							conn.end();
							callback(null);
						})
					})
				}
				} else {
					//update a non-repeating event
					pool.getConnection(function(err, conn) {
						conn.query('UPDATE ca_event SET ? WHERE id = "' + id + '"', qs, function(err, results) {
							if (err) throw err;

							conn.end();
							callback(null);
						})
					})
				}
};

exports.clearRelationTable = function(cid, msg, callback) {
	pool.getConnection(function(err, conn) {
		conn.query("DELETE FROM ca_relation WHERE id IN (SELECT ca_relation_id FROM (SELECT ca_relation_id FROM (SELECT ca_relation_id FROM ca_event WHERE ca_case_id = " + cid + " UNION SELECT ca_relation_id FROM ca_annotation WHERE ca_case_id = " + cid + ") tbl1 UNION ALL SELECT id FROM ca_relation WHERE ca_case_id = " + cid + ") tbl2 GROUP BY ca_relation_id HAVING count(*)=1 ORDER BY ca_relation_id)", function(err, results) {
			if(err) console.log(err);

			if(results.affectedRows > 0) {
				msg.push({
					operation: 'reload',
					resource: 'relation',
					id: cid,
					updated: new Date()
				});
			}

			conn.end();
			callback(null, msg);
		})
	})
};

exports.clearLocationTable = function(cid, msg, callback) {
	pool.getConnection(function(err, conn) {
		conn.query("DELETE FROM ca_location WHERE location IN (SELECT location FROM (SELECT location FROM (SELECT ca_location_location AS location FROM ca_event WHERE ca_case_id = " + cid + " UNION SELECT ca_location_location AS location FROM ca_annotation WHERE ca_case_id = " + cid + ") tbl1 UNION ALL SELECT location FROM ca_location WHERE ca_case_id = " + cid + ") tbl2 GROUP BY location HAVING count(*)=1 ORDER BY location)", function(err, results) {
			if(err) console.log(err);

			if(results.affectedRows > 0) {
				msg.push({
					operation: 'reload',
					resource: 'location',
					id: cid,
					updated: new Date()
				});
			}

			conn.end();
			callback(null, msg);
		})
	})
};

exports.generateId = function() {
	// unique id generator
		var S4 = function () {
		  return (((1 + Math.random()) * 0x10000) |
		                                     0).toString(16).substring(1);
		 };
			 return (S4() + S4() + "-" + S4() + "-" + S4() + "-" +
			                S4() + "-" + S4() + S4() + S4());
}
