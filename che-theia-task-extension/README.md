# Theia - Che Task Extension

The extension allows to work with the Che commands as with the Theia Tasks.

Contributes:
- Che task runner
- Che task resolver
- Che task provider

Adds the following commands (shortcut `F1`):
- Previews

The extension provides the `CheTaskService` allows to run a Che task by it's name.

The format of a Che task is the following:
```json
{
    "type": "che",
    "label": "",
    "command": "",
    "target": {
        "workspaceId": "",
        "machineName": ""
    },
    "previewUrl": ""
}
```
The variables substitution is supported for the `command` and `previewUrl` fields.

## Requirements

**Note,** currently che-theia-task-extension works with the Che workspaces run on Docker only since it completelly relies on the [machine-exec server](https://github.com/eclipse/che-theia-terminal-plugin/tree/master/machine-exec-server) which temporary has it's limitation.

The environment variables have to be set:
- `CHE_API`
- `CHE_WORKSPACE_ID`

The following mount should be set in the `che.env` file: `CHE_WORKSPACE_VOLUME=/var/run/docker.sock:/var/run/docker.sock;`

A machine with the running [machine-exec server](https://github.com/eclipse/che-theia-terminal-plugin/tree/master/machine-exec-server) must be present in a Che workspace with the following configuration:
```json
"terminal": {
  "env": {},
  "volumes": {},
  "servers": {
    "terminal-exec": {
      "attributes": {
        "type": "terminal"
      },
      "protocol": "ws",
      "port": "4444"
    }
  },
  "installers": [],
  "attributes": {
    "memoryLimitBytes": "2684354560"
  }
}
```

## How to run the extension with Che?

**Note,** currently che-theia-task-extension works with the Che workspaces run on Docker only since it completelly relies on the [machine-exec server](https://github.com/eclipse/che-theia-terminal-plugin/tree/master/machine-exec-server) which temporary has it's limitation.

Note, for now, the che-theia-task-extension isn't included into the [eclipse/che-theia](https://hub.docker.com/r/eclipse/che-theia/) docker image and [machine-exec](https://github.com/eclipse/che-theia-terminal-plugin/tree/master/machine-exec-server) server isn't in the Theia stack due to several issues ([#1](https://github.com/eclipse/che/issues/10590), [#2](https://github.com/eclipse/che/issues/10357), [#3](https://github.com/eclipse/che/issues/10358)).
So, in order to run the che-theia-task-extension with Che some manual steps are required:
- add [che-theia-task-extension](https://github.com/eclipse/che-theia-task-plugin) into [extensions.json](https://github.com/eclipse/che/blob/master/dockerfiles/theia/src/extensions.json) and build [che-theia image](https://github.com/eclipse/che/tree/master/dockerfiles/theia);
- build an image with machine-exec server by using script https://github.com/eclipse/che-theia-terminal-plugin/blob/master/createBuildBinaryImage.sh;
- run a Che workspace with the machines based on those two images following the above requirements.

Or just create a Che workspace based on [this stack](https://gist.github.com/AndrienkoAleksandr/595024d0904cf69fc044eac77330c999) (the che-theia-task-extension isn't included) and run the [che-theia-task-extension](https://github.com/eclipse/che-theia-task-plugin/tree/master/browser-app) in parallel with Che.

## License

[EPL-1.0](http://www.eclipse.org/legal/epl-v10.html)
