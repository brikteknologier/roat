#!/usr/bin/env node

var util = require('util');
var express = require('express');
var Subprocess = require("./subprocess");
var mu = require("mu2");
mu.root = __dirname + "/templates";

var argv = require("optimist").default({
        "port": 0,
        "bind": "127.0.0.1"
    }).argv;

var log = require("logginator")();

var app = express();
require('winston-tagged-http-logger')(app, log.createSublogger("http"));

var subprocesses = [];

function execute(cmd) {
    var subprocess = new Subprocess();
    subprocess.exec(cmd);
    subprocesses.push(subprocess);
}

execute(["ls", "-lha"]);
execute(["ls", "--help"]);
execute(["find", "/"]);

app.use("/static", express.static(__dirname + "/static"));

app.get('/', function (req, res, next) {
    res.writeHead(200, {
        "Content-Type": "text/html;charset=utf8"
    });
    var stream = mu.compileAndRender(
        'index.mu.html', {
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
    util.pump(stream, res);
});

app.get(/\/subprocess\/(\d+)$/, function (req, res, next) {
    var id = parseInt(req.params[0], 10);

    var subprocess = subprocesses[id];
    if (!subprocess) {
       res.send(404);
       return;
    }

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
});

app.listen(argv.port, argv.bind);
