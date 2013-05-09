var pool = require('../dbpool.js');

exports.mycases = function(req, res) {
	if (typeof req.session.username === "undefined") {
		res.redirect('/');
	} else {
		pool.getConnection(function(err, conn) {
			conn.query("SELECT ca_cases.id, ca_cases.title FROM ca_cases JOIN ca_usercase ON ca_cases.id = ca_usercase.ca_cases_id WHERE ca_usercase.ca_users_id = " + req.session.uid, function(err, results) {
				var caselist = [];

				if (err) throw err;
				if (results.length > 0) {
					caselist = results;
				}
				conn.end();
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
			conn.query("select uuid, title from ca_docs where ca_cases_id = " + req.query['cid'], function(err, results) {
				var doclist = [];

				if (err) throw err;
				if (results.length > 0) {
					doclist = results;
				}

				conn.query("select id, title from ca_calendars where ca_cases_id = " + req.query['cid'], function(err, results) {
					var callist = [];

					if (err) throw err;
					if (results.length > 0) {
						callist = results;
					}

					conn.query("select id, title from ca_graphs where ca_cases_id = " + req.query['cid'], function(err, results) {
						var graphlist = [];

						if (err) throw err;
						if (results.length > 0) {
							graphlist = results;
						}

						conn.query("select id, title from ca_maps where ca_cases_id = " + req.query['cid'], function(err, results) {
							var maplist = [];

							if (err) throw err;
							if (results.length > 0) {
								maplist = results;
							}
							conn.end();

							res.render('mycase', {
								title: req.query.ct,
								cid: req.query.cid,
								username: req.session.username,
								uid: req.session.uid,
								doclist: doclist,
								callist: callist,
								graphlist: graphlist,
								maplist: maplist
							});
						})
					});
				});
			});
		})
	}
};
