#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var optimist = require("optimist");
var logginator = require("logginator");
var SubprocessManager = require("./core/model/subprocess-manager");
var ActionManager = require("./core/model/action-manager");
var subsystems = require('./subsystems');

var log = logginator();

var actionManager = new ActionManager(JSON.parse(fs.readFileSync("actions.json", "utf8")));
var subprocessManager = new SubprocessManager(log.createSublogger("subprocessManager"));

var app = express();
require('winston-tagged-http-logger')(app, log.createSublogger("http"));


for (var subsystemName in subsystems) {
	if (!subsystems.hasOwnProperty(subsystemName)) continue;

	subsystems[subsystemName](log.createSublogger(subsystemName), actionManager, subprocessManager, app);
}


var argv = optimist.default({
        "port": 0,
        "bind": "127.0.0.1"
    }).argv;

app.listen(argv.port, argv.bind);
