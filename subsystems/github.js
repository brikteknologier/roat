var express = require('express');
var formidable = require('formidable');

var GITHUB_WEBHOOK_CONTENT_TYPE = "application/x-www-form-urlencoded";


function processWebHook(log, message, app, config) {
    if (!message || !message.repository) return false;

    var repo = message.repository.url;
    var actionId = config[repo];

    if (!actionId) {
        log.info("Received update message for repository: " + repo + ", no action configured");
        return true;
    }

    log.info("Received update message for repository: " + repo + ", triggering action " + actionId);
    var action = app.actionManager.get(actionId);
    if (!action) {
        log.warn("No action " + actionId + " configured");
        return false;
    }

    action.trigger(log.createSublogger(actionId), app.subprocessManager);

    return true;
}

module.exports = function (log, app, expressApp, configArgument) {
    var config = configArgument || {};

    expressApp.post('/github', function (req, res, next) {
        var reqLog = log.createSublogger(
          req.socket.remoteAddress + ":" + req.socket.remotePort);

        var contentType = req.headers["content-type"];

        if (contentType !== GITHUB_WEBHOOK_CONTENT_TYPE) {
            reqLog.error("Received POST with unsupported Content-Type: " + contentType);
            res.setHeader("Accept", GITHUB_WEBHOOK_CONTENT_TYPE);
            res.send(415);
            return;
        }

        var form = new (formidable.IncomingForm)();

        form.parse(req, function (err, fields, files) {
            var githubMessage;

            try {
                githubMessage = JSON.parse(fields.payload);
            }
            catch (error) {
                reqLog.error("Malformed request: " + error);
                res.send(400);
                return;
            }

            var ok = processWebHook(reqLog, githubMessage, app, config);

            if (ok) res.send(204);
            else res.send(500);
        });
    });
};
