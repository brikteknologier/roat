var events = require('events');
var util = require('util');
var childProcess = require("child_process");
var byline = require("byline");

function Subprocess() {
    events.EventEmitter.call(this);

    this.output = [];
}
util.inherits(Subprocess, events.EventEmitter);

Subprocess.prototype.exec = function (cmd, opts) {
    if (this.childProcess) throw { message: "Subprocess already running" };

    this.cmd = cmd;

    opts || (opts = {});
    var env = {};
    for (var key in (process.env || {})) env[key] = process.env[key];
    env['TERM'] = "xterm-color";
    for (var key in (opts.env || {})) env[key] = opts.env[key];

    this.childProcess = childProcess.spawn(cmd[0], cmd.slice(1), { cwd: opts.cwd, env: env });

    var self = this;

    ['stdout', 'stderr'].forEach(function (stream) {
        byline(self.childProcess[stream]).on('data', function (line) {
            var lineSpec = { stream: stream, line: line };
            self.output.push(lineSpec);
            self.emit('line', lineSpec);
        });
    });

    this.childProcess.on('close', function (code) {
        self.exitCode = code;
        self.emit('close', code);
    });
};

module.exports = Subprocess;
