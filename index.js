#!/usr/bin/env node

var express = require('express');
var mu = require("mu2");
var optimist = require("optimist");
var logginator = require("logginator");

mu.root = __dirname + "/templates";

var SubprocessManager = require("./model/subprocess-manager");
var views = {
    subprocess: require("./view/subprocess"),
    subprocessManager: require("./view/subprocess-manager")
};


var log = logginator();


var subprocessManager = new SubprocessManager(log.createSublogger("subprocessManager"));
subprocessManager.execute(["ls", "-lha"]);
subprocessManager.execute(["ls", "--help"]);
subprocessManager.execute(["find", "/"]);


var app = express();
require('winston-tagged-http-logger')(app, log.createSublogger("http"));

app.use("/static", express.static(__dirname + "/static"));

app.get('/', function (req, res, next) {
    views.subprocessManager(subprocessManager, res);
});

app.get(/\/subprocess\/(\d+)$/, function (req, res, next) {
    var id = parseInt(req.params[0], 10);

    var subprocess = subprocessManager.get(id);
    if (!subprocess) {
       res.send(404);
       return;
    }

    views.subprocess(subprocess, res);
});


var argv = optimist.default({
        "port": 0,
        "bind": "127.0.0.1"
    }).argv;

app.listen(argv.port, argv.bind);
