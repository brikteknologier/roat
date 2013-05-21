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

    expressApp.post(/\/action\/([^\/]+)$/, function (req, res, next) {
        var id = req.params[0];

        var action = app.actionManager.get(id);
        if (!action) {
           res.send(404);
           return;
        }

        var contentType = req.headers["content-type"];
        if (contentType === "application/vnd.brik.roat.trigger+json") {
            var id = action.trigger(app.subprocessManager);
            res.setHeader("Location", "/subprocess/" + id);
            res.send(201, "Created\n");
        } else {
            res.setHeader("Accept", "application/vnd.brik.roat.trigger+json");
            res.send(415, "415 Unsupported Media Type\n");
        }
    });
};
