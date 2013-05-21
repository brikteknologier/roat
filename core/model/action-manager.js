var Action = require('./action');

function ActionManager(spec) {
	this.actionList = [];
	this.actionDict = {};

	for (var id in spec) {
		if (!spec.hasOwnProperty(id)) continue;
		this.push(new Action(id, spec[id].title, spec[id].cmd, spec[id].opts));
	}
}

ActionManager.prototype.push = function (action) {
	this.actionDict[action.id] = action;
	this.actionList.push(action);
};

ActionManager.prototype.get = function (id) {
	return this.actionDict[id];
};

module.exports = ActionManager;
