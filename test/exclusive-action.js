var assert = require('assert');
var logginator = require('logginator');
var DaemonAction = require('../core/exclusive-action');

var id = "id";
var spec = {
    "title": "title",
    "cmd": [ "O", "M", "G" ]
};

describe("exclusive-action", function () {
    it("starts first time", function (done) {
        var log = logginator({});
        var action = new DaemonAction(id, spec);

        var wasExecuted = false;
        action.trigger(log, {
            execute: function () { wasExecuted = true; },
            get: function () { return undefined; }
        });

        assert(wasExecuted);
        done();
    });

    it("kills running process on trigger", function (done) {
        var subprocessId = Math.random();

        var log = logginator({});
        var action = new DaemonAction(id, spec);

        var wasKilled = false;
        function subprocessKiller() {
            wasKilled = true;
        }

        action.trigger(log, {
            execute: function () { return subprocessId; },
            get: function () { return undefined; }
        });

        action.trigger(log, {
            execute: function () { assert(false); },
            get: function (id) {
                assert.equal(subprocessId, id);
                return { kill: subprocessKiller };
            }
        });

        assert(wasKilled);
        done();
    });

    it("restarts after successful kill", function (done) {
        var subprocessId = Math.random();

        var log = logginator({});
        var action = new DaemonAction(id, spec);

        var wasRestarted = false;
        var wasKilled = false;
        var killedCallback;
        function subprocessKiller(log, callback) {
            wasKilled = true;
            killedCallback = callback;
        }

        action.trigger(log, {
            execute: function () { return subprocessId; },
            get: function () { return undefined; }
        });

        action.trigger(log, {
            execute: function () {
                assert(wasKilled);
                wasRestarted = true;
            },
            get: function (id) {
                assert.equal(subprocessId, id);
                return { kill: subprocessKiller };
            }
        });

        assert(wasKilled);
        assert(!wasRestarted);
        killedCallback();
        assert(wasRestarted);

        done();
    });
});
