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
}

module.exports = SubprocessManager;
