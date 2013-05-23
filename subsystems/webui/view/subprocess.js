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
            title: subprocess.cmd[0],
            commandLine: subprocess.cmd.join(' '),
            exitCode: (subprocess.exitCode == null ? "still running" : subprocess.exitCode),
            lines: subprocess.output.map(function (line) {
                return {
                    class: line.stream,
                    html: convert.toHtml(htmlFromText(line.line))
                };
            })
        });
    stream.pipe(res);
};
