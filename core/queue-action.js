function UniqueAction(id, spec) {
    this.id = id;
    this.title = spec.title;
    this.cmd = spec.cmd;
    this.cwd = spec.cwd;
    this.env = spec.env;

    this.pendingExecution = false;
    this.currentSubprocessId = null;
}

UniqueAction.prototype.hasSubprocess = function () {
    return this.currentSubprocessId !== null;
}

UniqueAction.prototype.trigger = function (log, subprocessManager) {
    var self = this;

    function startNew() {
        self.pendingExecution = false;
        self.currentSubprocessId = subprocessManager.execute(self.title, self.cmd, self.cwd, self.env);
        log.info(self.currentSubprocessId);

        var currentSubprocess = subprocessManager.get(self.currentSubprocessId);
        currentSubprocess.on('close', function () {
            self.currentSubprocessId = null;
            if (self.pendingExecution) {
                log.info("Starting pending execution");
                startNew();
            }
        });

        return self.currentSubprocessId;
    }

    if (this.currentSubprocessId !== null) {
        log.info("Action already running. Marked for pending execution");
        this.pendingExecution = true;
    } else {
        return startNew();
    }
};

module.exports = UniqueAction;
