#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var express = require('express');
var logginator = require("logginator");
var optimist = require("optimist");
var core = require('./core');
var subsystems = require('./subsystems');


var argv = optimist.default({
    config: "config.json"
}).argv;

try {
    var config = JSON.parse(fs.readFileSync(argv.config, "utf8"));
}
catch (err) {
    console.error("Error reading config file " + argv.config);
    if (err instanceof SyntaxError) {
        console.error("" + err);
    } else if (err.errno === 34) {
        console.error("File not found. You can specify the config file name with --config <filename>");
    }
    process.exit(1);
}

var package = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

var log = logginator(config.log);

log.info("Version " + package.version);

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

var httpConf = config.http || {};
var port = argv.port || httpConf.port || 0;
var bind = argv.bind || httpConf.bind || undefined;
expressApp.listen(port, bind);
