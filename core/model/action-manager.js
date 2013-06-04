var DaemonAction = require('./daemon-action');
var ImmediateAction = require('./action');

function ActionManager(spec) {
	this.actionList = [];
	this.actionDict = {};

	for (var id in spec) {
		if (!spec.hasOwnProperty(id)) continue;
		var actionSpec = spec[id];

		var constructor = ImmediateAction;
		if (actionSpec.mode === 'daemon') {
			constructor = DaemonAction;
		}
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
