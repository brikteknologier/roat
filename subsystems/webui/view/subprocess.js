var util = require('util');
var mu = require('mu2');
var Convert = require('ansi-to-html');

function htmlFromText(text) {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;'
    };
    return text.replace(/[&<]/g, function(tag) {
        return tagsToReplace[tag];
    });
}

module.exports = function (subprocess, res) {
    var convert = new Convert();

    res.writeHead(200, {
        "Content-Type": "text/html;charset=utf8"
    });

    var stream = mu.compileAndRender(
        'subprocess.mu.html', {
            title: subprocess.title,
            commandLine: subprocess.cmd.join(' '),
            running: subprocess.exitCode == null,
            exitCode: subprocess.exitCode,
            exitCodeClass: (subprocess.exitCode == null ? "" : (subprocess.exitCode === 0 ? "good" : "bad")),
            pid: subprocess.pid,
            lines: subprocess.output.map(function (line) {
                return {
                    class: line.stream,
                    html: convert.toHtml(htmlFromText(line.line))
                };
            })
        });

    // We apparently trigger a bug in the core stream library
    // if we simply use stream.pipe(res);
    stream.on('data', function (d) { res.write(d); });
    stream.on('end', function (d) { res.end(d); });
};
