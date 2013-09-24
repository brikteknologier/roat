var assert = require('assert');
var express = require('express');
var request = require('request');
var logginator = require('logginator');
var querystring = require('querystring');
var core = require('../core');
var github = require('../subsystems/github');

// From github documentation: https://help.github.com/articles/post-receive-hooks
var examplePostData = {
   "after":"1481a2de7b2a7d02428ad93446ab166be7793fbb",
   "before":"17c497ccc7cca9c2f735aa07e9e3813060ce9a6a",
   "commits":[
      {
         "added":[
         ],
         "author":{
            "email":"lolwut@noway.biz",
            "name":"Garen Torikian",
            "username":"octokitty"
         },
         "committer":{
            "email":"lolwut@noway.biz",
            "name":"Garen Torikian",
            "username":"octokitty"
         },
         "distinct":true,
         "id":"c441029cf673f84c8b7db52d0a5944ee5c52ff89",
         "message":"Test",
         "modified":[
            "README.md"
         ],
         "removed":[
         ],
         "timestamp":"2013-02-22T13:50:07-08:00",
         "url":"https://github.com/octokitty/testing/commit/c441029cf673f84c8b7db52d0a5944ee5c52ff89"
      },
      {
         "added":[
         ],
         "author":{
            "email":"lolwut@noway.biz",
            "name":"Garen Torikian",
            "username":"octokitty"
         },
         "committer":{
            "email":"lolwut@noway.biz",
            "name":"Garen Torikian",
            "username":"octokitty"
         },
         "distinct":true,
         "id":"36c5f2243ed24de58284a96f2a643bed8c028658",
         "message":"This is me testing the windows client.",
         "modified":[
            "README.md"
         ],
         "removed":[
         ],
         "timestamp":"2013-02-22T14:07:13-08:00",
         "url":"https://github.com/octokitty/testing/commit/36c5f2243ed24de58284a96f2a643bed8c028658"
      },
      {
         "added":[
            "words/madame-bovary.txt"
         ],
         "author":{
            "email":"lolwut@noway.biz",
            "name":"Garen Torikian",
            "username":"octokitty"
         },
         "committer":{
            "email":"lolwut@noway.biz",
            "name":"Garen Torikian",
            "username":"octokitty"
         },
         "distinct":true,
         "id":"1481a2de7b2a7d02428ad93446ab166be7793fbb",
         "message":"Rename madame-bovary.txt to words/madame-bovary.txt",
         "modified":[
         ],
         "removed":[
            "madame-bovary.txt"
         ],
         "timestamp":"2013-03-12T08:14:29-07:00",
         "url":"https://github.com/octokitty/testing/commit/1481a2de7b2a7d02428ad93446ab166be7793fbb"
      }
   ],
   "compare":"https://github.com/octokitty/testing/compare/17c497ccc7cc...1481a2de7b2a",
   "created":false,
   "deleted":false,
   "forced":false,
   "head_commit":{
      "added":[
         "words/madame-bovary.txt"
      ],
      "author":{
         "email":"lolwut@noway.biz",
         "name":"Garen Torikian",
         "username":"octokitty"
      },
      "committer":{
         "email":"lolwut@noway.biz",
         "name":"Garen Torikian",
         "username":"octokitty"
      },
      "distinct":true,
      "id":"1481a2de7b2a7d02428ad93446ab166be7793fbb",
      "message":"Rename madame-bovary.txt to words/madame-bovary.txt",
      "modified":[
      ],
      "removed":[
         "madame-bovary.txt"
      ],
      "timestamp":"2013-03-12T08:14:29-07:00",
      "url":"https://github.com/octokitty/testing/commit/1481a2de7b2a7d02428ad93446ab166be7793fbb"
   },
   "pusher":{
      "name":"none"
   },
   "ref":"refs/heads/master",
   "repository":{
      "created_at":1332977768,
      "description":"",
      "fork":false,
      "forks":0,
      "has_downloads":true,
      "has_issues":true,
      "has_wiki":true,
      "homepage":"",
      "id":3860742,
      "language":"Ruby",
      "master_branch":"master",
      "name":"testing",
      "open_issues":2,
      "owner":{
         "email":"lolwut@noway.biz",
         "name":"octokitty"
      },
      "private":false,
      "pushed_at":1363295520,
      "size":2156,
      "stargazers":1,
      "url":"https://github.com/octokitty/testing",
      "watchers":1
   }
};

describe("github", function () {
    it("handles correct input", function (done) {
        var outstandingCallbacks = 2;
        function decrementOutstanding() {
            if (!--outstandingCallbacks) done();
        }

        var log = logginator({});
        var app = core(log, {});

        app.actionManager.push({
            id: "test-action",
            trigger: decrementOutstanding
        });

        var expressApp = express();
        github(log, app, expressApp, {
            "https://github.com/octokitty/testing": "test-action"
        });
        expressApp.on('listening', function () {
            var address = expressApp.address();
        });

        // Would bind to 127.0.0.1, but that makes address() return null
        var httpServer = expressApp.listen(0);
        var port = httpServer.address().port;

        request({
            url: "http://127.0.0.1:" + port + "/github",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: querystring.stringify({ payload: JSON.stringify(examplePostData) })
        }, function (err, res, body) {
            assert.equal(err, null);
            assert.equal(Math.floor(res.statusCode / 100), 2);
            decrementOutstanding();
        });
    });

    it("can schedule multiple", function (done) {
        // This test unfortunately requires one second to run, due to a hardcoded
        // timer value inside the github subsystem module. The solution is to make
        // this interval configurable, or to employ some kind of virtual time.

        var outstandingCallbacks = 3;
        function decrementOutstanding() {
            if (!--outstandingCallbacks) done();
        }

        var log = logginator({});
        var app = core(log, {});

        app.actionManager.push({
            id: "test-action-1",
            trigger: decrementOutstanding
        });
        app.actionManager.push({
            id: "test-action-2",
            trigger: decrementOutstanding
        });

        var expressApp = express();
        github(log, app, expressApp, {
            "https://github.com/octokitty/testing": [ "test-action-1", "test-action-2" ]
        });
        expressApp.on('listening', function () {
            var address = expressApp.address();
        });

        // Would bind to 127.0.0.1, but that makes address() return null
        var httpServer = expressApp.listen(0);
        var port = httpServer.address().port;

        request({
            url: "http://127.0.0.1:" + port + "/github",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: querystring.stringify({ payload: JSON.stringify(examplePostData) })
        }, function (err, res, body) {
            assert.equal(err, null);
            assert.equal(Math.floor(res.statusCode / 100), 2);
            decrementOutstanding();
        });
    });

    it("handles missing config", function (done) {
        var log = logginator({});
        var app = core(log, {});

        var expressApp = express();
        github(log, app, expressApp);
        expressApp.on('listening', function () {
            var address = expressApp.address();
        });

        // Would bind to 127.0.0.1, but that makes address() return null
        var httpServer = expressApp.listen(0);
        var port = httpServer.address().port;

        request({
            url: "http://127.0.0.1:" + port + "/github",
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
