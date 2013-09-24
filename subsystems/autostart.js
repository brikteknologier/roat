var utils = require('./utils');

module.exports = function (log, app, expressApp, configArgument) {
    var interval = 1000;
    var actionIDs = configArgument || [];

    if (!Array.isArray(actionIDs)) {
        if (typeof actionIDs !== "string") {
            throw new Error("Invalid configuration of autostart. " +
                "Configuration must be string or array.");
        }
    }

    utils.triggerSingleOrArrayOfActions(
        log, actionIDs, interval,
        app.actionManager, app.subprocessManager
    );
};
