var util = require('util');
var mu = require('mu2');

module.exports = function (subprocess, res) {
    res.writeHead(200, {
        "Content-Type": "text/html;charset=utf8"
    });

    var stream = mu.compileAndRender(
        'subprocess.mu.html', {
            title: subprocess.cmd[0],
            commandLine: subprocess.cmd.join(' '),
            exitCode: (subprocess.exitCode == null ? "still running" : subprocess.exitCode),
            lines: subprocess.output
        });
    util.pump(stream, res);
};
