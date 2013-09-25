var util = require('util');
var mu = require('mu2');
var vagueTime = require('vague-time');

module.exports = function (actionManager, subprocessManager, res) {
    var subprocesses = subprocessManager.subprocesses;
    var now = new Date();

    var running = [], finished = [];
    subprocesses.forEach(function (s, index) {
        (s.exitCode == null ? running : finished).push(index);
    });

    finished.sort(function (a, b) {
        return subprocesses[b].timeStopped - subprocesses[a].timeStopped;
    });
    finished = finished.slice(0, 10);

    res.writeHead(200, {
        "Content-Type": "text/html;charset=utf8"
    });
    var stream = mu.compileAndRender(
        'index.mu.html', {
            actions: actionManager.actionList,
            running: running.map(function (subprocessId) {
                var s = subprocesses[subprocessId];
                return {
                    id: subprocessId,
                    title: s.title,
                    sincePrecise: s.timeStarted,
                    since: vagueTime.get({ from: now, to: s.timeStarted })
                };
            }),
            finished: finished.map(function (subprocessId) {
                var s = subprocesses[subprocessId];
                var statusClasses = ["failed", "normal"];
                var statusId = statusId = (s.exitCode === 0) ? 1 : 0;
                return {
                    id: subprocessId,
                    title: s.title,
                    status_class: statusClasses[statusId],
                    status: statusClasses[statusId],
                    finishedPrecise: s.timeStopped.toISOString(),
                    finished: vagueTime.get({ from: now, to: s.timeStopped })
                };
            })
        });

    // Workaround for apparently broken stream.pipe:
    stream.on('data', function (buf) { res.write(buf); });
    stream.on('end', function (buf) { res.end(buf); });
};
