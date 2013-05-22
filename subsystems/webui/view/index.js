var util = require('util');
var mu = require('mu2');

module.exports = function (actionManager, subprocessManager, res) {
    var subprocesses = subprocessManager.subprocesses;

    res.writeHead(200, {
        "Content-Type": "text/html;charset=utf8"
    });
    var stream = mu.compileAndRender(
        'index.mu.html', {
            actions: actionManager.actionList,
            subprocesses: subprocesses.map(function (s, index) {
                var statusClasses = ["running", "failed", "done"];
                var statusId = 0;
                if (s.exitCode != null) statusId = (s.exitCode === 0) ? 2 : 1;
                return {
                    id: index,
                    title: s.cmd.join(' '),
                    status_class: statusClasses[statusId],
                    status: statusClasses[statusId]
                };
            }).reverse()
        });
    stream.pipe(res);
};
