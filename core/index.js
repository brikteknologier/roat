var SubprocessManager = require("./subprocess-manager");
var ActionManager = require("./action-manager");

module.exports = function (log, actions) {
    var actionManager = new ActionManager(log.createSublogger("actionManager"), actions || {});
    var subprocessManager = new SubprocessManager(log.createSublogger("subprocessManager"));

    return {
        actionManager: actionManager,
        subprocessManager: subprocessManager
    }
};
