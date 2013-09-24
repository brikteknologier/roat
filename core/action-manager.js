var modes = {
    "immediate": require('./immediate-action'),
    "exclusive": require('./exclusive-action'),
    "queue": require('./queue-action')
};

function ActionManager(log, spec) {
    this.actionList = [];
    this.actionDict = {};

    var ok = true;

    for (var id in spec) {
        var actionSpec = spec[id];

        var mode = actionSpec.mode || "immediate";
        if (!modes.hasOwnProperty(mode)) {
            throw new Error("Invalid mode specified for action " + JSON.stringify(id));
        }

        if (actionSpec.opts) {
            log.error('Obsolete configuration "opts" specified for action ' +
                JSON.stringify(id) + '. "env" and "cwd" should be specified ' +
                'in the top level of the action specification.');
            ok = false;
        }

        var constructor = modes[mode];
        this.push(new constructor(id, actionSpec));
    }

    if (!ok) throw new Error("Failed to initialize actions");
}

ActionManager.prototype.push = function (action) {
    this.actionDict[action.id] = action;
    this.actionList.push(action);
};

ActionManager.prototype.get = function (id) {
    if (!this.actionDict.hasOwnProperty(id)) return undefined;
    return this.actionDict[id];
};

module.exports = ActionManager;
