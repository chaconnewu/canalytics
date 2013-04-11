var pool = require('../dbpool.js');

exports.information = function(req, res){
	res.send({
		"name": "CAnalytics Store API",
		"version": "1.0.0"
	})
};

exports.findall = function(req, res){
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				conn.query("SELECT * FROM ca_annotations", function(err, results){
					var annotation_list = [];
					
					if(err) throw err;
					if(results.length > 0) {
						annotation_list = results;
					}
					pool.release(conn);
					
					annotation_list.forEach(function(annotation){
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
					})

					res.send(annotation_list);
				})
			}
		});
	}
};

exports.search = function(req, res){
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var docid, limit, offset, q;
				
				q = "SELECT * FROM ca_annotations";
				docid = (req.query['docid'] != null) ? req.query['docid'] : '*';
				limit = (req.query['limit'] != null) ? req.query['limit'] : 999999999999999999;
				offset = (req.query['offset'] != null) ? req.query['offset'] : 0;
				
				if(req.query['docid'] != null) {
					q = q + " WHERE ca_docs_uuid = '" + req.query['docid'] + "'"
				}
				
				if(limit!=null && offset==null) {
					q = q + " LIMIT " + limit
				}
				
				if(limit!=null && offset!=null) {
					q = q + " LIMIT " + limit + " OFFSET " + offset
				}
				
				conn.query(q, function(err, results){
					var annotation_list = [], annotation;
					
					if(err) throw err;
					if(results.length > 0) {
						annotation_list = results;
					}
					pool.release(conn);
					
					annotation_list.forEach(function(annotation){
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
					})

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
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				var query = conn.query('INSERT INTO ca_annotations SET ?', {
					id: req.body.id,
					ca_docs_uuid: req.body.docid,
					text: req.body.text,
					created: null,
					updated: null,
					quote: req.body.quote,
					range_start: req.body.ranges[0].start,
					range_end: req.body.ranges[0].end,
					startOffset: req.body.ranges[0].startOffset,
					endOffset: req.body.ranges[0].endOffset,
					location: req.body.location,
					oldlocation: req.body.oldlocation,
					start: req.body.start,
					oldstart: req.body.oldstart,
					end: req.body.end,
					oldend: req.body.oldend,
					people: req.body.people.join(),
					oldpeople: req.body.oldpeople.join(),
					relationship: req.body.relationship.join(),
					oldrelationship: req.body.oldrelationship.join(),
					tags: req.body.tags.join(),
				}, 
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
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.acquire(function(err, conn){
			if(err){
				pool.release(conn);
			}else{
				console.log(req.body);
				var query = conn.query('UPDATE ca_annotations SET ? WHERE id = "' + req.body.id + '"', {
					text: req.body.text,
					location: req.body.location,
					oldlocation: req.body.oldlocation,
					start: req.body.start,
					oldstart: req.body.oldstart,
					end: req.body.end,
					oldend: req.body.oldend,
					people: req.body.people.join(),
					oldpeople: req.body.oldpeople.join(),
					relationship: req.body.relationship.join(),
					oldrelationship: req.body.oldrelationship.join(),
					tags: req.body.tags.join(),
				}, 
				function(err, result){
					if(err) console.log(query);
					pool.release(conn);
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
				var query = conn.query('DELETE FROM ca_annotations WHERE id = ' + req.params.id, 
				function(err, result){
					if(err) throw err;
					pool.release(conn);
					res.send();
				});
			}
		});
	}	
}





















