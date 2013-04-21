var pool = require('../dbpool.js');

/*
 * GET home page.
 */

exports.index = function(req, res){
	if(typeof req.session.username == 'undefined') {
		res.render('index', { title: 'CAnalytics' });
	}
	else {
		res.redirect('/mycases');
	}
};

exports.login = function(req, res){
	pool.getConnection(function(err, conn){
			conn.query("SELECT * FROM ca_users WHERE username = " + conn.escape(req.body.username) + " AND password = " + conn.escape(req.body.password), function(err, results){
				if(err) throw err;
				if(results[0]) {
					req.session.username = results[0].username;
					req.session.uid = results[0].id;
				}
				conn.end();
				res.redirect('/');
			});
	})
};

exports.signup = function(req, res){
	pool.getConnection(function(err, conn){
			conn.query("INSERT INTO ca_users SET ?", {username: req.body.username, password: req.body.password, email: req.body.password}, function(err, results){
				if(err) throw err;
				conn.end();
			});
	})
	res.redirect('/');
};

exports.logout = function(req, res){
	delete req.session.username;
	res.redirect('/');
}