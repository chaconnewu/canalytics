/**
 *
 * Created by dong on 3/23/14.
 */
var fs = require('fs');
var pool = require('../dbpool.js');


exports.activitylog = function(req, res) {
    var log = req.body;
    if (!log) return;
    log.user = req.session.username;
    exports.logs(log, res);
    res.send('');
}

exports.logs = function(log, res) {
    if (!log) return;

    var str = '';

    var user = log.user;
    var operation = log.operation;
    var artifact = log.artifact;
    var data = log.data;
    var time = new Date();

    if (!user) return;
    str = time + '\t' + user + '\t' + artifact + '\t' + operation + '\t' + data + '\n';

    // write to file
    fs.appendFile('activity.log', str, function(err) {
        if (err) {
            console.log('Activity log failed:' + err);
        }
    });
    // write to database
    pool.getConnection(function(err, conn) {
       conn.query('SELECT id from ca_user WHERE username=' + conn.escape(user), function(err, results) {
           if (err) {
               console.warn("Activity log failed, no such user exists: ", + err);
               conn.end();
               return;
           }
           user = results[0].id;

           conn.query('INSERT INTO ca_activitylog SET ?', {
                   user_id: user,
                   operation: operation,
                   artifact: artifact,
                   data: data,
                   time: time
               }, function(err, results) {
                   if (err) {
                       console.warn("Activity log failed: " + err);
                       conn.end();
                       return;
                   }
                   conn.end();
               }
           );
       })
   });
}
