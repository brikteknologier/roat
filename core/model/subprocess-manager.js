var events = require('events');
var util = require('util');
var Subprocess = require('./subprocess');

function SubprocessManager(log) {
    events.EventEmitter.call(this);

    this.log = log;
    this.subprocesses = [];
}
util.inherits(SubprocessManager, events.EventEmitter);

SubprocessManager.prototype.execute = function (title, cmd, opts) {
    var subprocess = new Subprocess(title);
    subprocess.exec(cmd, opts);
    var id = this.subprocesses.push(subprocess) - 1;

    var processLogger = this.log.createSublogger(id);
    processLogger.info("Started subprocess " + JSON.stringify(cmd));
    subprocess.on('close', function () {
        processLogger.info("Terminated with status " + subprocess.exitCode);
    });

    this.emit('newProcess', id);

    return id;
};

SubprocessManager.prototype.get = function (id) {
    return this.subprocesses[id];
};

SubprocessManager.prototype.killAllRunning = function (callback) {
    var self = this;
    var liveProcesses = 0;

    function maybeDoneKilling() {
        if (liveProcesses === 0) callback();
    }

    this.subprocesses.forEach(function (subprocess) {
        if (subprocess.exitCode != null) return;

        self.log.info("Sending \"" + subprocess.title + "\" (" + subprocess.pid + ") SIGKILL");
        try {
            subprocess.signal("SIGKILL");
            liveProcesses += 1;
            subprocess.on('close', function () {
                self.log.info('"' + subprocess.title + "\" (" + subprocess.pid + ") terminated");
                liveProcesses -= 1;
                maybeDoneKilling();
            });
        }
        catch (err) {
            self.log.error(JSON.stringify(err));
        }
    });

    maybeDoneKilling();
};

module.exports = SubprocessManager;
