function ExclusiveAction(id, spec) {
    this.id = id;
    this.title = spec.title;
    this.cmd = spec.cmd;
    this.cwd = spec.cwd;
    this.env = spec.env;
    this.currentSubprocessId = null;
}

ExclusiveAction.prototype.hasSubprocess = function () {
    return this.currentSubprocessId !== null;
}

ExclusiveAction.prototype.trigger = function (log, subprocessManager) {
    var self = this;

    function startNew() {
        self.currentSubprocessId = subprocessManager.execute(self.title, self.cmd, self.cwd, self.env);
        return self.currentSubprocessId;
    }

    var currentSubprocess = subprocessManager.get(this.currentSubprocessId);
    if (currentSubprocess) {
        currentSubprocess.kill(
            log.createSublogger(this.currentSubprocessId),
            startNew
        );
    } else {
        return startNew();
    }
};

module.exports = ExclusiveAction;
