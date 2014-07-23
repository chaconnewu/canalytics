var pool = require('../dbpool.js');

exports.mycases = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			conn.query("SELECT ca_case.id AS id, ca_case.title AS title FROM ca_case JOIN ca_usercase ON ca_case.id = ca_usercase.ca_case_id WHERE ca_usercase.ca_user_id = " + req.session.uid, function(err, results) {
				var caselist = [];

				if (err) throw err;
				if (results.length > 0) {
					caselist = results;
				}
				conn.end();
				console.log(req.session.uid);
				console.log('hello~~~~~~~~~~~~' + caselist);
				res.render('mycases', {
					title: "Cases Management Page",
					caselist: caselist
				});
			})
		})
	}
};

exports.mycase = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			conn.query("SELECT uuid, title FROM ca_doc WHERE ca_case_id = " + req.query['ca_case_id'], function(err, results) {
				var doclist = [];

				if (err) throw err;
				if (results.length > 0) {
					doclist = results;
				}

				conn.query("SELECT calendar FROM ca_case WHERE id = " + req.query['ca_case_id'], function(err, result) {
					var cal;

					if (err) throw err;

						cal = result[0].calendar;

					conn.query("SELECT graph FROM ca_case WHERE id = " + req.query['ca_case_id'], function(err, result) {
						var graph;

						if (err) throw err;

							graph = result[0].graph;

						conn.query("SELECT map FROM ca_case WHERE id = " + req.query['ca_case_id'], function(err, result) {
							var map;

							if (err) throw err;

								map = result[0].map;

							conn.query("SELECT color FROM ca_usercase WHERE ca_user_id = " + req.session.uid + " AND ca_case_id = " + req.query['ca_case_id'], function(err, result) {
								if(err) throw err;

								var color = result[0].color;

								conn.end();

	              if(userblocklist[req.session.uid] && userblocklist[req.session.uid]!='') {
									blocklist[userblocklist[req.session.uid]] = '';
									userblocklist[req.session.uid] = '';
								}

								res.render('mycase', {
									usercolor: color,
									ca_case_title: req.query.ca_case_title,
									ca_case_id: req.query.ca_case_id,
									username: req.session.username,
									uid: req.session.uid,
									doclist: doclist,
									cal: cal,
									graph: graph,
									map: map
								});
							})
						})
					});
				});
			});
		})
	}
};

exports.filter = function(req, res) {
	if(typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		var query = "SELECT * FROM (SELECT ca_annotation.ca_case_id AS ca_case_id, ca_annotation.id AS aid, NULL AS eid, ca_annotation.start AS start, ca_annotation.end AS end, ca_annotation.ca_location_location AS location, ca_location.lat AS lat, ca_location.lng AS lng, ca_relation.id AS rid, ca_relation.relation AS relation, ca_person.name AS name FROM ca_annotation LEFT JOIN ca_location ON ca_annotation.ca_location_location = ca_location.location LEFT JOIN ca_relation ON ca_annotation.ca_relation_id = ca_relation.id LEFT JOIN ca_person on ca_relation.id = ca_person.ca_relation_id UNION SELECT ca_event.ca_case_id AS ca_case_id, NULL AS aid, ca_event.id AS eid, ca_event.start AS start, ca_event.end AS end, ca_event.ca_location_location AS location, ca_location.lat AS lat, ca_location.lng AS lng, ca_relation.id AS rid, ca_relation.relation AS relation, ca_person.name AS name FROM ca_event LEFT JOIN ca_location ON ca_event.ca_location_location = ca_location.location LEFT JOIN ca_relation ON ca_event.ca_relation_id = ca_relation.id LEFT JOIN ca_person ON ca_relation.id = ca_person.ca_relation_id) AS tempt WHERE ca_case_id = " + req.query.ca_case_id + " AND ";
		var condition = "";

		if(req.query.location_select){
				condition += '(';
				for(var i in req.query.location_select){
					condition += 'location = "' + req.query.location_select[i] + '" OR '
				}
				condition = condition.substring(0, condition.length-4);
				condition += ') AND '
		}
		if(req.query.person_select){
			condition += 'name IN ';
			var people = '("' + req.query.person_select.join('","') + '")';
			condition += people;
			condition += ' AND ';
		}
		if(req.query.relation_select){
			condition += 'relation IN ';
			var relations = '("' + req.query.relation_select.join('","') + '")';
			condition += relations;
			condition += ' AND ';
		}
		if(req.query.time_from&&req.query.time_to){
			condition += 'STR_TO_DATE(start, "%Y-%m-%dT%k:%i") > STR_TO_DATE("' + req.query.time_from + '", "%Y-%m-%dT%k:%i") AND STR_TO_DATE(end, "%Y-%m-%dT%k:%i") < STR_TO_DATE("' + req.query.time_to + '", "%Y-%m-%dT%k:%i")';
			condition += ' AND ';
		}

		query += condition;
		query = query.substring(0, query.length-5);
		console.log(query);
		pool.getConnection(function(err, conn){
			conn.query(query, function(err, results){
				if(err) throw err;

				conn.end();
				res.send(results);
			})
		})
	}
}
