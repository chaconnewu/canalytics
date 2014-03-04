// Create a MySQL connection pool with
// a max of 10 connections
var mysql = require('mysql');

var pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'caadmin',
	password: 'caadmin',
	database: 'ca',
	connectionLimit: 5000,
	queueLimit: 5000
});

module.exports = pool;