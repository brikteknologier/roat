var MemoryStream = require('memorystream');
var express = require('express');
var mu = require("mu2");
mu.root = __dirname + "/templates";

var views = {
    subprocess: require("./view/subprocess"),
    index: require("./view/index")
};

module.exports = function (log, app, expressApp) {
    expressApp.use("/static", express.static(__dirname + "/static"));

    expressApp.get('/', function (req, res, next) {
        views.index(app.actionManager, app.subprocessManager, res);
    });

    expressApp.get(/\/subprocess\/(\d+)$/, function (req, res, next) {
        var id = parseInt(req.params[0], 10);

        var subprocess = app.subprocessManager.get(id);
        if (!subprocess) {
           res.send(404);
           return;
        }

        views.subprocess(subprocess, res);
    });

    expressApp.post(/\/subprocess\/(\d+)$/, function (req, res, next) {
        var id = parseInt(req.params[0], 10);

        var subprocess = app.subprocessManager.get(id);
        if (!subprocess) {
           res.send(404);
           return;
        }

        var contentType = req.headers["content-type"];
        if (contentType === "application/vnd.brik.roat.signal+json") {
            var bodyBuf = new MemoryStream(null, { readable: false });
            req.pipe(bodyBuf);
            bodyBuf.on('end', function () {
                var signal;
                try {
                    var body = bodyBuf.toString();
                    signal = JSON.parse(body);
                }
                catch (err) {
                    log.error("Bad request from client " + err);
                    res.send(400, "Bad Request\n\nRequest body must be a valid UTF-8 encoded JSON string\n");
                    return;
                }
                log.info("Sending signal " + signal + " to subprocess " + id);
                try {
                    subprocess.signal(signal);
                    res.send(200);
                }
                catch (err) {
                    log.error("Error while sending signal to subprocess: " + err);
                    res.send(500);
                }
            });
        } else {
            res.setHeader("Accept", "application/vnd.brik.roat.signal+json");
            res.send(415, "415 Unsupported Media Type\n");
        }
    });

    expressApp.post(/\/action\/([^\/]+)$/, function (req, res, next) {
        var id = req.params[0];

        var action = app.actionManager.get(id);
        if (!action) {
           res.send(404);
           return;
        }

        var socketLog = log.createSublogger(
            req.socket.remoteAddress + ":" + req.socket.remotePort);
        var actionLog = socketLog.createSublogger(id);

        var contentType = req.headers["content-type"];
        if (contentType === "application/vnd.brik.roat.trigger+json") {
            var id = action.trigger(actionLog, app.subprocessManager);
            if (id != null) {
                res.setHeader("Location", "/subprocess/" + id);
                res.send(201, "Created\n");
            } else {
                res.send(204);
            }
        } else {
            res.setHeader("Accept", "application/vnd.brik.roat.trigger+json");
            res.send(415, "415 Unsupported Media Type\n");
        }
    });
};
