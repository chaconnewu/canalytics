/**
 *
 * Created by dong on 3/23/14.
 */
function calog(oper) {
    var log = {
        operation: oper.operation,
        target: oper.target,
        activity: oper.activity,
        data: oper.data
    }
    $.post('/activitylog', log, function(error, result) {
        if (error) {
            console.warn('Error logging activity: ' + error);
        }

    })
}
