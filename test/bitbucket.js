var assert = require('assert');
var express = require('express');
var request = require('request');
var logginator = require('logginator');
var querystring = require('querystring');
var core = require('../core');
var bitbucket = require('../subsystems/bitbucket');

// From bitbucket documentation: https://confluence.atlassian.com/display/BITBUCKET/POST+Service+Management
var examplePostData = {
    "canon_url": "https://bitbucket.org",
    "commits": [
        {
            "author": "marcus",
            "branch": "featureA",
            "files": [
                {
                    "file": "somefile.py",
                    "type": "modified"
                }
            ],
            "message": "Added some featureA things",
            "node": "d14d26a93fd2",
            "parents": [
                "1b458191f31a"
            ],
            "raw_author": "Marcus Bertrand <marcus@somedomain.com>",
            "raw_node": "d14d26a93fd28d3166fa81c0cd3b6f339bb95bfe",
            "revision": 3,
            "size": -1,
            "timestamp": "2012-05-30 06:07:03",
            "utctimestamp": "2012-05-30 04:07:03+00:00"
        }
    ],
    "repository": {
        "absolute_url": "/marcus/project-x/",
        "fork": false,
        "is_private": true,
        "name": "Project X",
        "owner": "marcus",
        "scm": "hg",
        "slug": "project-x",
        "website": ""
    },
    "user": "marcus"
};

describe("bitbucket", function () {
    it("handles correct input", function (done) {
        var actionStub = {
            id: "test-action",
            hasBeenInvoked: false,
            trigger: function () { actionStub.hasBeenInvoked = true; }
        };

        var log = logginator({});
        var app = core(log, {});

        app.actionManager.push(actionStub);

        var expressApp = express();
        bitbucket(log, app, expressApp, {
            "/marcus/project-x/": "test-action"
        });
        expressApp.on('listening', function () {
            var address = expressApp.address();
        });

        // Would bind to 127.0.0.1, but that makes address() return null
        var httpServer = expressApp.listen(0);
        var port = httpServer.address().port;

        request({
            url: "http://127.0.0.1:" + port + "/bitbucket",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: querystring.stringify({ payload: JSON.stringify(examplePostData) })
        }, function (err, res, body) {
            assert.equal(err, null);
            assert.equal(Math.floor(res.statusCode / 100), 2);
            assert(actionStub.hasBeenInvoked);
            done();
        });
    });

    it("handles missing config", function (done) {
        var log = logginator({});
        var app = core(log, {});

        var expressApp = express();
        bitbucket(log, app, expressApp);
        expressApp.on('listening', function () {
            var address = expressApp.address();
        });

        // Would bind to 127.0.0.1, but that makes address() return null
        var httpServer = expressApp.listen(0);
        var port = httpServer.address().port;

        request({
            url: "http://127.0.0.1:" + port + "/bitbucket",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: querystring.stringify({ payload: JSON.stringify(examplePostData) })
        }, function (err, res, body) {
            assert.equal(err, null);
            assert.equal(Math.floor(res.statusCode / 100), 2);
            done();
        });
    });
});
