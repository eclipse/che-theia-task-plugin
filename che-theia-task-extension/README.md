# Theia - Che Task Extension

The extension allows to work with the Che commands as with the Theia Tasks.

Contributes:
- Che task runner
- Che task resolver
- Che task provider

Adds the following commands (shortcut `F1`):
- Previews

The environment variables have to be set:
- `CHE_API`
- `CHE_WORKSPACE_ID`

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

## License

[EPL-1.0](http://www.eclipse.org/legal/epl-v10.html)
