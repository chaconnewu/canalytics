var pool = require('../dbpool.js');

exports.read = function(req, res){
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				conn.query("SELECT ca_events.id, ca_events.title, ca_events.start, ca_events.end, ca_events.repeat, ca_events.interval, ca_events.end_after, GROUP_CONCAT(ca_people.name) as people, ca_relationships.relationship FROM ca_events LEFT JOIN ca_relationships ON ca_events.ca_relationships_id = ca_relationships.id LEFT JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id where ca_calendars_id = '" + req.params.id + "' GROUP BY ca_events.id", function(err, results){
					var event_list = [];
					
					if(err) throw err;
					if(results.length > 0) {
						if(results.people){
							for(var i=0; i<results.length; i++){
								results[i].people = results[i].people.split(",");
							}
						}
						event_list = results;
					}
					pool.release(conn);
					res.send(event_list);
				})
			}
		});
	}
};

exports.create = function(req, res) {
	var cols = ['id','title','start','end','repeat','interval','end_after','ca_calendars_id','ca_calendars_ca_cases_id','index','repeating'];
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var qs = {};
				Object.keys(req.body).forEach(function(key){
					if(cols.indexOf(key) > -1) qs[key] = req.body[key];
				});
				conn.query('INSERT INTO ca_events SET ?', qs,
				function(err, result){
					if(err) throw err;
					
					if(req.body.relationship && req.body.relationship!='') {
						conn.query('INSERT INTO ca_relationships SET ?', {
							relationship: req.body.relationship,
							ca_graphs_id: req.body.gid,
							ca_graphs_ca_cases_id: req.body.ca_calendars_ca_cases_id,
							ca_events_id: req.body.id
						}, function(err, result) {
							if(err) throw err;

							var rid = result.insertId;
							var values = '';

							for(var i in req.body.people) {
								values = values + "('" + req.body.people[i] + "', " + rid + ", '" + req.body.gid + "', " + req.body.ca_calendars_ca_cases_id + "),";
							}
							if(values[values.length-1] == ",") {
								values = values.slice(0, -1);
							}
							conn.query('INSERT INTO ca_people (name, ca_relationships_id, ca_relationships_ca_graphs_id, ca_relationships_ca_graphs_ca_cases_id) VALUES ' + values, function(err, result) {
								if(err) throw err;
								
								var r_insert = [];
								for(var i in req.body.people) {
									var r = {};
									r.id = rid;
									r.name = req.body.people[i];
									r.relationship = req.body.relationship;
									r_insert.push(r);
								}
								req.body.r_insert = r_insert;
								
								conn.query('UPDATE ca_events SET ca_relationships_id = ' + rid + ' WHERE id = "' + req.body.id + '"', function(err, result){
									if(err) throw err;
									
									//process repeating event
									if(req.body.repeating == true){
										var repeat = parseInt(req.body.repeat);
										var interval = req.body.interval;
										var end_after = new Date(req.body.end_after);
										var start = new Date(req.body.start);
										var end_after_s = end_after.getTime();
										var start_s = start.getTime();
										var interval_s = 0;
										switch(interval){
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

										var freq = Math.floor((end_after_s - start_s)/(repeat*interval_s));
														start: format_date(new Date(calEvent.start.getTime()+j*interval_s)),
														end: format_date(new Date(calEvent.end.getTime()+j*interval_s)),
										
									}
									pool.release(conn);
									res.send(req.body);
								})
							})
						})
					} else {
						//process repeating event
						if(req.body.repeating == true){
							
						}
						pool.release(conn);
						res.send(req.body);
					}
				})
		  }
	  })
	}
};

exports.update = function(req, res) {
	var update_list = ['title','start','end','repeat','interval','end_after'];
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var qs = {};
				Object.keys(req.body).forEach(function(key){
					if(update_list.indexOf(key) > -1) qs[key] = req.body[key];
				})
			
			conn.query('SELECT id, relationship FROM ca_relationships WHERE ca_events_id = "' + req.params.id + '"', function(err, result){
					if(result.length > 0){
						var rid = result[0].id;
						var rel = result[0].relationship;
						
						if(req.body.relationship&&req.body.relationship!=''){
							//check whether the relationship in database is changed, if not update people table only, then update event table
							if(rel == req.body.relationship) {
								//update people table
								conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, result){
									var people_new = [];
									var people_old = [];
									var insert_list = [];
									var delete_list = [];
									
									for(var i in result) {
										people_old.push(result[i].name);
									}
									
									for(var i in req.body.people) {
										people_new.push(req.body.people[i]);
									}
									
									for(var i=0; i<people_new.length; i++) {
										var idx = people_old.indexOf(people_new[i]);
										if(idx > -1) {
											people_new.splice(i,1);
											people_old.splice(idx,1);
											i--;
										}
									}
									
									insert_list = people_new;
									delete_list = people_old;
									
									var insert_values = '',
									    delete_values = '(';

									for(var i in insert_list) {
										insert_values += "('" + insert_list[i] + "', " + rid + ", '" + req.body.gid + "', " + req.body.ca_calendars_ca_cases_id + "),";
									}
									if(insert_values[insert_values.length-1] == ",") {
										insert_values = insert_values.slice(0, -1);
									}
									
									for(var i in delete_list) {
										delete_values += "'" + delete_list[i] + "',";
									}
									if(delete_values[delete_values.length-1] == ",") {
										delete_values = delete_values.slice(0, -1);
									}
									delete_values += ")";

									if(insert_list.length > 0) {
										conn.query('INSERT INTO ca_people (name, ca_relationships_id, ca_relationships_ca_graphs_id, ca_relationships_ca_graphs_ca_cases_id) VALUES ' + insert_values, function(err, result) {
											if(err) throw err;
											
											var r_insert = [];
											for(var i in insert_list) {
												var r = {};
												r.id = rid;
												r.name = insert_list[i];
												r.relationship = rel;
												r_insert.push(r);
											}
											
											req.body.r_insert = r_insert;
											
											if(delete_list.length > 0) {
												conn.query('DELETE FROM ca_people WHERE name IN ' + delete_values + ' AND ca_relationships_id = ' + rid, function(err, result){
													if(err) throw err;

													var r_delete = [];
												  for(var i in delete_list) {
														var r = {};
														r.id = rid;
														r.name = delete_list[i];
														r.relationship = req.body.rel;
														r_delete.push(r);
													}
													req.body.r_delete = r_delete;
													
													conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, 
													function(err, result){
														if(err) throw err;
														pool.release(conn);
														res.send(req.body);
													})
												})
											} else {
												conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, 
												function(err, result){
													if(err) throw err;
													pool.release(conn);
													res.send(req.body);
												})
											}
										})
									} else if(delete_list.length > 0){
										conn.query('DELETE FROM ca_people WHERE name IN ' + delete_values, function(err, result){
											if(err) throw err;

											var r_delete = [];
										  for(var i in delete_list) {
												var r = {};
												r.id = rid;
												r.name = delete_list[i];
												r.relationship = req.body.relationship;
												r_delete.push(r);
											}
											req.body.r_delete = r_delete;
											
											conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, 
											function(err, result){
												if(err) throw err;
												pool.release(conn);
												res.send(req.body);
											})
										})
									} else {
										conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs,
										function(err, result){
											if(err) throw err;
											pool.release(conn);
											res.send(req.body);
										})
									}
								})
							} else {
							//if the old relationship is changed, delete the old relationship and insert the new relationship, then update people table, then update event table
								//delete old relationship
								conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, result){
									if(err) throw err;
									
									var r_delete = [];
								  for(var i in result) {
										var r = {};
										r.id = rid;
										r.name = result[i];
										r.relationship = rel;
										r_delete.push(r);
									}
									req.body.r_delete = r_delete;
									
									conn.query('DELETE FROM ca_relationships WHERE id = ' + rid, function(err, result){
										//insert new relationship
										if(err) throw err;

										conn.query('INSERT INTO ca_relationships SET ?', {
											relationship: req.body.relationship,
											ca_graphs_id: req.body.gid,
											ca_graphs_ca_cases_id: req.body.ca_calendars_ca_cases_id,
											ca_events_id: req.params.id
										}, function(err, result) {
											if(err) throw err;

											rid = result.insertId;
											var values = '';

											for(var i in req.body.people) {
												values = values + "('" + req.body.people[i] + "', " + rid + ", '" + req.body.gid + "', " + req.body.ca_calendars_ca_cases_id + "),";
											}
											if(values[values.length-1] == ",") {
												values = values.slice(0, -1);
											}
											conn.query('INSERT INTO ca_people (name, ca_relationships_id, ca_relationships_ca_graphs_id, ca_relationships_ca_graphs_ca_cases_id) VALUES ' + values, function(err, result) {
												if(err) throw err;

												var r_insert = [];
												for(var i in req.body.people) {
													var r = {};
													r.id = rid;
													r.name = req.body.people[i];
													r.relationship = req.body.relationship;
													r_insert.push(r);
												}
												req.body.r_insert = r_insert;

												qs['ca_relationships_id'] = rid;

												conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, 
												function(err, result){
													if(err) throw err;
													pool.release(conn);
													res.send(req.body);
												})
											})
										})
									})
								})	
							}
						} else {
							//delete the old relationship in database, then update event
							conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, result){
								if(err) throw err;
								
								var r_delete = [];
							  for(var i in result) {
									var r = {};
									r.id = rid;
									r.name = result[i];
									r.relationship = rel;
									r_delete.push(r);
								}
								req.body.r_delete = r_delete;
								
								conn.query('DELETE FROM ca_relationships WHERE id = ' + rid, function(err, result){
									if(err) throw err;

									rid = null;
									qs['ca_relationships_id'] = null;

									delete req.body.relationship;
									delete req.body.people;

									conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, 
									function(err, result){
										if(err) throw err;
										pool.release(conn);
										res.send(req.body);
									})
								})
							})
						}
					} else {
						//in case of no relationship is found in database, check whether there is relationship, if there is insert the new relationship, 
						//then update people table, then update event table
						if(req.body.relationship&&req.body.relationship!=''){
								conn.query('INSERT INTO ca_relationships SET ?', {
									relationship: req.body.relationship,
									ca_graphs_id: req.body.gid,
									ca_graphs_ca_cases_id: req.body.ca_calendars_ca_cases_id,
									ca_events_id: req.params.id
								}, function(err, result) {
									if(err) throw err;

									var rid = result.insertId;
									var values = '';

									for(var i in req.body.people) {
										values = values + "('" + req.body.people[i] + "', " + rid + ", '" + req.body.gid + "', " + req.body.ca_calendars_ca_cases_id + "),";
									}
									if(values[values.length-1] == ",") {
										values = values.slice(0, -1);
									}
									conn.query('INSERT INTO ca_people (name, ca_relationships_id, ca_relationships_ca_graphs_id, ca_relationships_ca_graphs_ca_cases_id) VALUES ' + values, function(err, result) {
										if(err) throw err;

										var r_insert = [];
										for(var i in req.body.people) {
											var r = {};
											r.id = rid;
											r.name = req.body.people[i];
											r.relationship = req.body.relationship;
											r_insert.push(r);
										}
										
										req.body.r_insert = r_insert;
										
										qs['ca_relationships_id'] = rid;
										conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs, 
										function(err, result){
											if(err) throw err;
											pool.release(conn);
											res.send(req.body);
										})
									})
								})
						} else {
							//update the event
							conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs,
							function(err, result){
								if(err) throw err;
								pool.release(conn);
								res.send(req.body);
							})
						}
					}
				})
		  }
		});
	}	
};

exports.delete = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				conn.query('SELECT * FROM ca_relationships WHERE ca_events_id = "' + req.params.id + '"', function(err, result){
					if(result.length > 0){
						var rid = result[0].id;
						var rel = result[0].relationship;
						
						if(result[0].ca_locations_id||result[0].ca_annotations_id){
							//keep the relationship, only delete the event
							conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '"', function(err, result){
								if(err) throw err;
								
								pool.release(conn);
								res.send(req.params.id);
							})
						} else {
							//delete the relationship, then delete the event
							conn.query('SELECT name FROM ca_people WHERE ca_relationships_id = ' + rid, function(err, result){
								var r_delete = [];
							  for(var i in result) {
									var r = {};
									r.id = rid;
									r.name = result[i].name;
									r.relationship = rel;
									r_delete.push(r);
								}
								req.body.r_delete = r_delete;
								
								conn.query('DELETE FROM ca_relationships WHERE id = ' + rid, function(err, result){
									if(err) throw err;

									conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '"', function(err, result){
										if(err) throw err;

										req.body.id = req.params.id;

										pool.release(conn);
										res.send(req.body);
									})
								})
							})
						}
					} else {
						//delete the event
						conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '"', function(err, result){
							if(err) throw err;
							
							pool.release(conn);
							res.send(req.params.id);
						})
					}
				})
			}
		});
	}	
}





















