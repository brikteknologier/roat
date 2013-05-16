function ActionManager() {
	this.actionList = [];
	this.actionDict = {};
}

ActionManager.prototype.push = function (action) {
	this.actionDict[action.id] = action;
	this.actionList.push(action);
};

ActionManager.prototype.get = function (id) {
	return this.actionDict[id];
};

module.exports = ActionManager;
