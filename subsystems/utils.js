function triggerSingleOrArrayOfActions(
    log, actionIDs, interval, actionManager, subprocessManager
) {
    if (!Array.isArray(actionIDs)) {
        if (typeof actionIDs !== "string") {
            throw new Error("Invalid argument to triggerSingleOrArrayOfActions. " +
                "`actionIDs` must be string or array.");
        }
        actionIDs = [actionIDs];
    }

    var delay = 0;
    var scheduled = [], failed = [];

    actionIDs.forEach(function (id) {
        var action = actionManager.get(id);
        if (!action) {
            failed.push(id);
            return;
        }

        setTimeout(function () {
            log.info("Triggering " + JSON.stringify(id));
            var actionLog = log.createSublogger(id);
            var subprocessId = action.trigger(actionLog, subprocessManager);
        }, delay);
        delay += interval;

        scheduled.push(id);
    });

    if (failed.length) {
        log.error("The following IDs were configured for scheduling, but " +
            "not defined as actions: " + JSON.stringify(failed));
    }

    if (scheduled.length > 1) {
        log.info("Scheduled the following actions: " + JSON.stringify(scheduled));
    }

    if (!scheduled.length && failed.length) {
        log.warn("No actions were scheduled");
    }
}

exports.triggerSingleOrArrayOfActions = triggerSingleOrArrayOfActions;
