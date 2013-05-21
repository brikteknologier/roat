#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var optimist = require("optimist");
var logginator = require("logginator");
var SubprocessManager = require("./model/subprocess-manager");
var ActionManager = require("./model/action-manager");
var github = require("./github");
var webui = require("./webui");

var log = logginator();

var actionManager = new ActionManager(JSON.parse(fs.readFileSync("actions.json", "utf8")));
var subprocessManager = new SubprocessManager(log.createSublogger("subprocessManager"));

var app = express();
require('winston-tagged-http-logger')(app, log.createSublogger("http"));


github(log.createSublogger("github"), actionManager, subprocessManager, app);
webui(actionManager, subprocessManager, app);


var argv = optimist.default({
        "port": 0,
        "bind": "127.0.0.1"
    }).argv;

app.listen(argv.port, argv.bind);
