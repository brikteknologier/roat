#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var logginator = require("logginator");
var optimist = require("optimist");
var core = require('./core');
var subsystems = require('./subsystems');


var config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var log = logginator(config.log);

var app = core(log.createSublogger("core"), config.actions);

var expressApp = express();
require('winston-tagged-http-logger')(expressApp, log.createSublogger("http"));

for (var subsystemName in subsystems) {
    if (!subsystems.hasOwnProperty(subsystemName)) continue;
    subsystems[subsystemName](
        log.createSublogger(subsystemName),
        app,
        expressApp,
        config[subsystemName]
    );
}

config.http = config.http || {};

var argv = optimist.argv;
var port = argv.port || config.http.port || 0;
var bind = argv.bind || config.http.bind || undefined;

expressApp.listen(port, bind);
