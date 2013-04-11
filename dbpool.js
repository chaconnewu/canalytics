// Create a MySQL connection pool with
// a max of 10 connections, a min of 2, and a 30 second max idle time
var poolModule = require('generic-pool');

var pool = poolModule.Pool({
    name     : 'mysql',
    create   : function(callback) {
        var connection = require('mysql').createConnection({
					host: 'localhost',
					user: 'caadmin',
					password: 'caadmin',
					database: 'ca'
				});
        
        connection.connect();

        // parameter order: err, resource
        // new in 1.0.6
        callback(null, connection);
    },
    destroy  : function(connection) { connection.destroy(); },
    max      : 10,
    // optional. if you set this, make sure to drain() (see step 3)
    min      : 2, 
    // specifies how long a resource can stay idle in pool before being removed
    idleTimeoutMillis : 30000,
     // if true, logs via console.log - can also be a function
    log : true 
});

module.exports = pool;