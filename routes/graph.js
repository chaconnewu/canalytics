var pool = require('../dbpool.js');

exports.read = function(req, res){
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				conn.query("SELECT ca_people.name, ca_relationships.relationship, ca_relationships.id FROM ca_relationships JOIN ca_people ON ca_relationships.id = ca_people.ca_relationships_id WHERE ca_relationships.ca_graphs_id = '" + req.params.id + "'", function(err, results){
					var relation_list = [];
					
					if(err) throw err;
					if(results.length > 0) {
						relation_list = results;
					}
					pool.release(conn);
					
					/*annotation_list.forEach(function(annotation){
						annotation.docid = annotation.ca_docs_uuid;
						annotation.ranges = [];
						annotation.ranges[0] = {
							start: annotation.range_start,
							startOffset: annotation.startOffset,
							end: annotation.range_end,
							endOffset: annotation.endOffset
						};
						annotation.people = annotation.people.split(",");
						annotation.relationship = annotation.relationship.split(",");
						annotation.tags = annotation.tags.split(",")
					})*/
					res.send(relation_list);
				})
			}
		});
	}
};

exports.create = function(req, res) {
	var cols = ['id','title','start','end','repeat','interval','end_after','ca_calendars_id','ca_calendars_ca_cases_id'];
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
				})
				console.log(qs);
				var query = conn.query('INSERT INTO ca_events SET ?', qs, 
				function(err, result){
					if(err) throw err;
					pool.release(conn);
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
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var qs = {};
				Object.keys(req.body).forEach(function(key){
					if(update_list.indexOf(key) > -1) qs[key] = req.body[key];
				})
				var query = conn.query('UPDATE ca_events SET ? WHERE id = "' + req.params.id + '"', qs,
				function(err, result){
					if(err) console.log(query);
					pool.release(conn);
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
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var query = conn.query('DELETE FROM ca_events WHERE id = "' + req.params.id + '"', 
				function(err, result){
					if(err) throw err;
					pool.release(conn);
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
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var query = conn.query('SELECT DISTINCT name FROM ca_people WHERE ca_relationships_ca_graphs_ca_cases_id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					pool.release(conn);
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
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var query = conn.query('SELECT DISTINCT relationship FROM ca_relationships WHERE ca_graphs_ca_cases_id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					pool.release(conn);
					res.send(result);
				});
			}
		});
	}
};






















