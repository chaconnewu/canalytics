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
			conn.query("SELECT * FROM ca_user WHERE username = " + conn.escape(req.body.username) + " AND password = " + conn.escape(req.body.password), function(err, results){
				if(err) throw err;
				if(results[0]) {
					req.session.uid = results[0].id;
					req.session.username = results[0].username;
				}
				conn.end();
				res.redirect('/');
			});
	})
};

exports.signup = function(req, res){
    var msg = '';
	pool.getConnection(function(err, conn){
			conn.query("INSERT INTO ca_user SET ?", {username: req.body.username, password: req.body.password, email: req.body.email}, function(err, results){
				if(err) {
                    msg += 'Sign up failed...Something is wrong with the server';
                    throw err;
                }
				conn.end();
                msg += 'Sign up success!';
			});
	})
	res.redirect('/');
};

exports.logout = function(req, res){
	blocklist[userblocklist[req.session.uid]] = '';
	userblocklist[req.session.uid] = '';
	delete req.session.username;
	delete req.session.uid;
	res.redirect('/');
};

exports.sync = function(req, res){
	console.log('im syncing');
	console.log(req.body);
	if(req.body.id){
		//a user is trying to edit an existing resource, if the resource is idling, the resource will be blocked for the user, if the resource is busy, the user will be refused.
		console.log(blocklist);
		console.log(userblocklist);
		console.log(req.body.id);
		if(blocklist[req.body.id] && blocklist[req.body.id]!='') {
			//some one is editing the resource, block the current user.
			res.send(blocklist[req.body.id]+" is entering information ... please try again later.");
		} else {
			//the resource doesn't exist in the blocklist, add it to the list, and give the user write access.
			blocklist[req.body.id] = req.session.username;
			userblocklist[req.session.uid] = req.body.id;
			res.send(req.session.username+" is entering information ...")
		}
	} else {
		//a user is creating a new resource, there is no synchronous problem.
		res.send(req.session.username+" is entering information ...");
	}
};

exports.desync = function(req, res){
	console.log('im desyncing');
	console.log(blocklist);
	console.log(userblocklist);
	console.log(req.session.uid);
	if(userblocklist[req.session.uid] && userblocklist[req.session.uid]!='') {
		blocklist[userblocklist[req.session.uid]] = '';
		userblocklist[req.session.uid] = '';
	}
	res.send("");
}