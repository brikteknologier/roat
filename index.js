#!/usr/bin/env node

var util = require('util');
var Subprocess = require("./subprocess");
var mu = require("mu2");
mu.root = __dirname + "/templates";

var argv = require("optimist").default({
        "port": 0,
        "bind": "127.0.0.1"
    }).argv;

var log = require("logginator")();
var app = require("express")();
require('winston-tagged-http-logger')(app, log.createSublogger("http"));

var subprocesses = [];

var ls = new Subprocess();
ls.exec(["ls", "-lha"]);
subprocesses.push(ls);

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
