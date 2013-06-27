function ImmediateAction(id, spec) {
    this.id = id;
    this.title = spec.title;
    this.cmd = spec.cmd;
    this.opts = spec.opts;
}

ImmediateAction.prototype.trigger = function (log, subprocessManager) {
    return subprocessManager.execute(this.title, this.cmd, this.opts);
};

module.exports = ImmediateAction;
