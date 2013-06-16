module.exports = function (log, app, expressApp, configArgument) {
    var delay = 1000;
    var scheduled = [];

    configArgument = configArgument || [];

    configArgument.forEach(function (id) {
        var action = app.actionManager.get(id);
        if (!action) {
            log.error("Unable to find action with id " + JSON.stringify(id));
            return;
        }

        var actionLog = log.createSublogger(id);
        setTimeout(function () {
            log.info("Triggering " + JSON.stringify(id));
            var subprocessId = action.trigger(actionLog, app.subprocessManager);
        }, delay);
        delay += 1000;

        scheduled.push(id);
    });

    if (scheduled.length) {
        log.info("Scheduled the following actions for automatic execution: " + JSON.stringify(scheduled));
    }
};
