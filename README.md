Roat
====
Roat is an automation core, well suited for implementing a Continuous
Integration server. Its primary focus is to trigger the running of scripts
based on detecting pushes to source code repositories. There is also a web
interface for inspecting the current state and manually triggering scripts.

Configuration
=============
Roat will read configuration from `config.json` by default, or the filename
specified with the `--config` command line argument if present. For a complete
example configuration file, please refer to
[example.config.json](example.config.json).

The configuration is a dictionary (`{}`) split into the following sections:

http
----
The application listens to http connections on the specified port and binds to
the specified address:

    "http": {
        "port": 9999,
        "bind": "127.0.0.1"
    }

The defaults are `0` (automatic assignment) for `port` and `0.0.0.0` (listen
to connections from all source addresses) for `bind`.

It is also possible to specify these options on the command line with the
`--port` and `--bind` command line arguments.

actions
-------
The scripts the Roat server runs are specified as actions in the config:

    "actions": {
        <action-id>: <action-spec>,
        <action-id>: <action-spec>,
        ...
    }

The `<action-id>` is used to refer to a specific action by other subsystems.

`<action-spec>` has a human readable `title`, a command line specified as a
list in `cmd`, optionally the desired working directory as `cwd` and
optionally necessary environmental variables in `env`:

    "ls-color": {
        "title": "List files",
        "cmd": [ "ls", "-lhaG" ],
        "cwd": "/root",
        "env": {
            "CLICOLOR_FORCE": "true"
        }
    }

Normally, an action will execute in a new subprocess every time it is
triggered. Alternative running modes exist and are specified in the "mode"
field, for example:

    {
        ...
        "mode": "exclusive"
    }

Available modes are:

 * `immediate`: The default. Start a new subprocess immediately, every time
    the action is triggered.
 * `exclusive`: When the action is triggered, Roat will kill currently running
    instances before starting a new subprocess.
 * `queue`: Run at most one instance of this action at a time, but wait for
    any currently running process to finish instead of killing it.

github
------
Roat listens for [github WebHook messages][githubWebhook] on its `/github` URL.

[githubWebhook]: https://help.github.com/articles/post-receive-hooks

The github subsystem triggers actions based on which repository was updated:

    "github": {
        <repository-URL>: <action-ids>,
        <repository-URL>: <action-ids>,
        ...
    }

For example:

    "github": {
        "https://github.com/octokitty/testing": "ls-color",
        "https://github.com/octokitty/schmesting": [ "ls-color", "ls" ]
    }

Note that you are required to use the full URL, with the `https` scheme and no
trailing slash.

bitbucket
---------
Roat listens for [bitbucket's POST Service messages][bitbucketPOST] on its
`/bitbucket` URL.

[bitbucketPOST]: https://confluence.atlassian.com/display/BITBUCKET/POST+Service+Management

The bitbucket subsystem triggers actions based on which repository was updated:

    "bitbucket": {
        <repository-URL>: <action-ids>,
        <repository-URL>: <action-ids>,
        ...
    }

For example:

    "bitbucket": {
        "/jespern/bitbucket/": "ls-color",
        "/jespern/git-7/": [ "ls-color", "ls" ]
    }

Note that you are required to use only the `path`-part of the URL, including a
trailing slash. The format is `/<username>/<repository-name>/`.

autostart
---------
Roat will trigger the configured actions automatically on start:

    "autostart": [
        <action-id>,
        <action-id>,
        ...
    ]

For example:

    "autostart": [
        "ls-color"
    ]

In order to be kind to the host machine, it starts the configured services one
at a time, separated by one second in time.

log
---
Roat will direct log output to the transports specified under this key:

    "log": [
        <transport>,
        <transport>,
        ...
    ]

For example:

    "log": [
        {
            "transport": "console"
        }, {
            "transport": "syslog"
        }
    ]

Roat uses [logginator][logginator] for logging and log target configuration.
For further details about this config, please consult the
[logginator][logginator] documentation.

[logginator]: https://github.com/brikteknologier/logginator


Running
=======
When you have configured roat, you can run

    npm start

It will output something like:

    12:30:34.566 2013-05-27 Monday
    12:30:34.570 [roat] Version 1.1.3 (on node v0.10.7)
    12:30:34.583 [roat, http] Listening on 127.0.0.1:9999

Visit the specified address in a web browser (http://127.0.0.1:9999) to
inspect the current system status.

Add a WebHook URL to your repositories in github to allow Roat to react to
pushes to github. The POST from github must reach the `/github` endpoint of
Roat to allow this to work.

Happy automation!

----

Development of Roat is lovingly sponsored by 
[BRIK Videobase AS](http://www.github.com/brikteknologier) in Bergen, Norway.
