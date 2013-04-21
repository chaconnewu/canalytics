// Create a MySQL connection pool with
// a max of 10 connections
var mysql = require('mysql');

var pool = mysql.createPool({
	host: 'localhost',
	user: 'caadmin',
	password: 'caadmin',
	database: 'ca'
});

module.exports = pool;