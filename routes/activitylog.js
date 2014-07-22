/**
 *
 * Created by dong on 3/23/14.
 */
var fs = require('fs');


exports.activitylog = function(req, res) {
    var log = req.body;
    if (!log) return;
    log.user = req.session.username;
    exports.logs(log);
}

exports.logs = function(log) {
    if (!log) return;

    var str = '';

    var user = log.user;
    var operation = log.operation;
    var artifact = log.artifact;
    var data = log.data;
    var time = new Date().toISOString();

    if (!user) return;
    // str = time + '\t' + user + '\t' + operation + '\t' + target + '\t' + activity + '\t' + data + '\n';

    // write to file
    // fs.appendFile('activitylog.txt', str, function(err) {
    //     if (err) {
    //         console.log('Activity log failed:' + err);
    //     }
    // });
    // write to database
   pool.getConnection(function(err, conn) {
       conn.query('SELECT id from ca_user WHERE username=' + conn.escape(user), function(err, results) {
           if (err) {
               console.log("Activity log failed, no such user exists: ", + err);
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
                       console.log("Activity log failed: " + err);
                       conn.end()
                       return;
                   }
                   conn.end()
               }
           );
       })
   });
}
