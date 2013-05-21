function Action(id, title, cmd, opts) {
	this.id = id;
	this.title = title;
	this.cmd = cmd;
	this.opts = opts;
}

Action.prototype.trigger = function (subprocessManager) {
	return subprocessManager.execute(this.cmd, this.opts);
};

module.exports = Action;
