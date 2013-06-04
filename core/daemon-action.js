function DaemonAction(id, spec) {
    this.id = id;
    this.title = spec.title;
    this.cmd = spec.cmd;
    this.opts = spec.opts;
    this.currentSubprocessId = null;
}

DaemonAction.prototype.trigger = function (log, subprocessManager) {
    var self = this;

    function startNew() {
        self.currentSubprocessId = subprocessManager.execute(self.title, self.cmd, self.opts);
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

module.exports = DaemonAction;
