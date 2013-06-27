var modes = {
    "immediate": require('./immediate-action'),
    "daemon": require('./daemon-action')
};

function ActionManager(spec) {
    this.actionList = [];
    this.actionDict = {};

    for (var id in spec) {
        var actionSpec = spec[id];

        var mode = actionSpec.mode || "immediate";
        if (!modes.hasOwnProperty(mode)) {
            throw new Error("Invalid mode specified for action " + id);
        }

        var constructor = modes[mode];
        this.push(new constructor(id, actionSpec));
    }
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
