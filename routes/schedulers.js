var pool = require('../dbpool.js');

exports.list = function(req, res){
	var uid = req.query.uid;
	res.send("ok");
}