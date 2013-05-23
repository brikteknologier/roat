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
list in `cmd` and optionally necessary environmental variables in `opts.env`:

    "ls-color": {
        "title": "List files",
        "cmd": [ "ls", "-lhaG" ],
        "opts": {
            "env": {
                "CLICOLOR_FORCE": "true"
            }
        }
    }

github
------
Roat listens for [github WebHook messages][1] on its `/github` URL.

[1]: https://help.github.com/articles/post-receive-hooks

The github subsystem triggers actions based on which repository was updated:

    "github": {
        <repository-URL>: <action-id>,
        <repository-URL>: <action-id>,
        ...
    }

Example:

    "github": {
        "https://github.com/octokitty/testing": "ls-color"
    }

Running
=======
When you have configured roat, you can run

    ./index.js

It will output something like:

    16:59:09.081 2013-05-21 Tuesday
    16:59:09.098 [roat, http] Listening on 127.0.0.1:9999

Visit the specified address in a web browser (http://127.0.0.1:9999) to
inspect the current system status.

Add a WebHook URL to your repositories in github to allow Roat to react to
pushes to github. The POST from github must reach the `/github` endpoint of
Roat to allow this to work.

Happy automation!

----

Development of Roat is lovingly sponsored by 
[BRIK Tekonologier AS](http://www.github.com/brikteknologier) in Bergen, Norway.
