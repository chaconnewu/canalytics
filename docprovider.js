var crypto = require('crypto');
var pool = require('../dbpool.js');

DocProvider = function(){};

DocProvider.prototype.dummyData = ["plaindoc","Record Analyst (Phase 1) v2(version)"];

DocProvider.prototype.findAll = function(uid) {
	var list
	pool.acquire(function(err, conn) {
		if(err) {
			
		} else {
			conn.query('', function(err, results) {
				
			})
		}
	});
	return list
};

DocProvider.prototype.findById = function(id, callback) {
	var result = null;
	for(var i=0;i<this.dummyData.length;i++) {
		if(this.dummyData[i]._id == id) {
			result = this.dummyData[i];
			break;
		}
	}
	callback(null, result);
};

exports.DocProvider = DocProvider;