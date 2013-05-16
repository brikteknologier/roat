#!/usr/bin/env node

var express = require('express');
var mu = require("mu2");
var optimist = require("optimist");
var logginator = require("logginator");

mu.root = __dirname + "/templates";

var SubprocessManager = require("./model/subprocess-manager");
var ActionManager = require("./model/action-manager");
var views = {
    subprocess: require("./view/subprocess"),
    index: require("./view/index")
};


var log = logginator();


var actionManager = new ActionManager({
    "ls-color": {
        "title": "List files",
        "cmd": [ "ls", "-lhaG" ],
        "opts": {
            "env": {
                "CLICOLOR_FORCE": "true"
            }
        }
    },
    "ls-error": {
        "title": "List files, with error",
        "cmd": [ "ls", "--help" ]
    },
    "find": {
        "title": "Find all files",
        "cmd": [ "find", "/" ]
    }
});

var subprocessManager = new SubprocessManager(log.createSublogger("subprocessManager"));


var app = express();
require('winston-tagged-http-logger')(app, log.createSublogger("http"));

app.use("/static", express.static(__dirname + "/static"));

app.get('/', function (req, res, next) {
    views.index(actionManager, subprocessManager, res);
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

app.post(/\/action\/([^\/]+)$/, function (req, res, next) {
    var id = req.params[0];

    log.info(id);

    var action = actionManager.get(id);
    if (!action) {
       res.send(404);
       return;
    }

    var contentType = req.headers["content-type"];
    if (contentType === "application/vnd.brik.roat.trigger+json") {
        var id = action.trigger(subprocessManager);
        res.setHeader("Location", "/subprocess/" + id);
        res.send(201, "Created\n");
    } else {
        res.setHeader("Accept", "application/vnd.brik.roat.trigger+json");
        res.send(415, "415 Unsupported Media Type\n");
    }
});


var argv = optimist.default({
        "port": 0,
        "bind": "127.0.0.1"
    }).argv;

app.listen(argv.port, argv.bind);
