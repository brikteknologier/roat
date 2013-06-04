var events = require('events');
var util = require('util');
var childProcess = require("child_process");
var byline = require("byline");

function Subprocess(title) {
    events.EventEmitter.call(this);

    this.title = title;
    this.output = [];
}
util.inherits(Subprocess, events.EventEmitter);

Subprocess.prototype.isRunning = function () {
    return this.exitCode === undefined;
};

Subprocess.prototype.exec = function (cmd, opts) {
    if (this.childProcess) throw { message: "Subprocess already running" };

    this.cmd = cmd;

    opts || (opts = {});
    var env = {};
    for (var key in (process.env || {})) env[key] = process.env[key];
    env['TERM'] = "xterm-color";
    for (var key in (opts.env || {})) env[key] = opts.env[key];

    this.childProcess = childProcess.spawn(cmd[0], cmd.slice(1), { cwd: opts.cwd, env: env, detached: true });
    this.pid = this.childProcess.pid;

    var self = this;

    ['stdout', 'stderr'].forEach(function (stream) {
        byline(self.childProcess[stream]).on('data', function (line) {
            var lineSpec = { stream: stream, line: line };
            self.output.push(lineSpec);
            self.emit('line', lineSpec);
        });
    });
    this.childProcess.stdin.end();

    this.childProcess.on('close', function (code, signal) {
        self.exitCode = signal || code;
        self.emit('close', code, signal);
    });
};

Subprocess.prototype.signal = function (signal) {
    if (this.exitCode != null) throw new Error("Can not send signal to finished process");
    process.kill(-this.childProcess.pid, signal);
    this.output.push({ stream: "process-control", line: "Sent the process group " + signal });
};

Subprocess.prototype.kill = function (log, callback) {
    var self = this;

    if (!this.isRunning()) {
        callback();
        return;
    }

    this.childProcess.on('close', callback);

    log.info("Sending subprocess SIGTERM");
    this.signal("SIGTERM");
    setTimeout(function () {
        if (self.isRunning()) {
            log.info("Sending subprocess SIGKILL");
            self.signal("SIGKILL");
        }
    }, 5000);
};

module.exports = Subprocess;
