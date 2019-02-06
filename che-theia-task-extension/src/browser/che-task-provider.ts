/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject } from 'inversify';
import { che } from '@eclipse-che/api';
import { TaskProvider } from '@theia/task/lib/browser';
import { TaskConfiguration } from '@theia/task/lib/common';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../common/task-protocol';
import { CheWorkspaceClientService } from '../common/che-workspace-client-service';

/** Reads the commands from the current Che workspace and provides it as Task Configurations. */
@injectable()
export class CheTaskProvider implements TaskProvider {

    @inject(CheWorkspaceClientService)
    protected readonly cheWsClient: CheWorkspaceClientService;

    async provideTasks(): Promise<TaskConfiguration[]> {
        const tasks: TaskConfiguration[] = [];

        const commands = await this.cheWsClient.getCommands();
        for (const command of commands) {
            const providedTask: CheTaskConfiguration = {
                type: CHE_TASK_TYPE,
                label: `${command.name!}`,
                command: command.commandLine!,
                target: {
                    machineName: this.getCommandAttribute(command, 'machineName')
                },
                previewUrl: this.getCommandAttribute(command, 'previewUrl'),
                _source: 'che'
            };
            tasks.push(providedTask);
        }
        return tasks;
    }

    protected getCommandAttribute(command: che.workspace.Command, attrName: string): string | undefined {
        if (!command.attributes) {
            return undefined;
        }
        for (const attr in command.attributes) {
            if (attr === attrName) {
                return command.attributes[attr];
            }
        }
        return undefined;
    }
}
