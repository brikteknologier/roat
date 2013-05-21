var express = require('express');
var MemoryStream = require('memorystream');

var GITHUB_WEBHOOK_CONTENT_TYPE = "application/json";


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

    action.trigger(app.subprocessManager);

    return true;
}

module.exports = function (log, app, expressApp, config) {
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

        var bufferStream = new MemoryStream(null, {readable: false});
        req.pipe(bufferStream);
        bufferStream.on('end', function () {
            var bufferString = bufferStream.toString();
            var githubMessage;

            try {
                githubMessage = JSON.parse(bufferString);
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
