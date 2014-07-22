/**
 *
 * Created by dong on 3/23/14.
 */
function calog(oper) {
    var log = {
        operation: oper.operation,
        artifact: oper.artifact,
        data: oper.data
    };
    $.post('/activitylog', log, function(error, result) {

    })
}
