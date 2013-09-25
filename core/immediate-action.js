function ImmediateAction(id, spec) {
    this.id = id;
    this.title = spec.title;
    this.cmd = spec.cmd;
    this.cwd = spec.cwd;
    this.env = spec.env;
}

ImmediateAction.prototype.hasSubprocess = function () {
    return false;
}

ImmediateAction.prototype.trigger = function (log, subprocessManager) {
    return subprocessManager.execute(this.title, this.cmd, this.cwd, this.env);
};

module.exports = ImmediateAction;
