var express = require('express');
var formidable = require('formidable');
var utils = require('./utils');

var BITBUCKET_WEBHOOK_CONTENT_TYPE = "application/x-www-form-urlencoded";


function processWebHook(log, message, app, config) {
    if (!message || !message.repository) return false;

    var repo = message.repository.absolute_url;
    var actionConfig = config[repo];

    if (!actionConfig) {
        log.info("Received update message for repository: " + repo + ", no action configured");
        return true;
    }

    log.info("Received update message for repository: " + repo);
    utils.triggerSingleOrArrayOfActions(
        log, actionConfig, 1000,
        app.actionManager, app.subprocessManager
    );

    return true;
}

module.exports = function (log, app, expressApp, configArgument) {
    var config = configArgument || {};

    expressApp.post('/bitbucket', function (req, res, next) {
        var reqLog = log.createSublogger(
          req.socket.remoteAddress + ":" + req.socket.remotePort);

        var contentType = req.headers["content-type"];

        if (contentType !== BITBUCKET_WEBHOOK_CONTENT_TYPE) {
            reqLog.error("Received POST with unsupported Content-Type: " + contentType);
            res.setHeader("Accept", BITBUCKET_WEBHOOK_CONTENT_TYPE);
            res.send(415);
            return;
        }

        var form = new (formidable.IncomingForm)();

        form.parse(req, function (err, fields, files) {
            var bitbuketMessage;

            try {
                bitbuketMessage = JSON.parse(fields.payload);
            }
            catch (error) {
                reqLog.error("Malformed request: " + error);
                res.send(400);
                return;
            }

            var ok = processWebHook(reqLog, bitbuketMessage, app, config);

            if (ok) res.send(204);
            else res.send(500);
        });
    });
};
