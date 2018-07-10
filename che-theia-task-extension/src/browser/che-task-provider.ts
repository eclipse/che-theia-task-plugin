/*
 * Copyright (c) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { injectable, inject } from 'inversify';
import { ICommand } from '@eclipse-che/workspace-client';
import { TaskProvider } from '@theia/task/lib/browser';
import { TaskConfiguration } from '@theia/task/lib/common';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../common/task-protocol';
import { CheWorkspaceClient } from '../common/che-workspace-client';

/** Reads the commands from the current Che workspace and provides it as Task Configurations. */
@injectable()
export class CheTaskProvider implements TaskProvider {

    @inject(CheWorkspaceClient)
    protected readonly cheWsClient: CheWorkspaceClient;

    async provideTasks(): Promise<TaskConfiguration[]> {
        const tasks: TaskConfiguration[] = [];

        const commands = await this.cheWsClient.getCommands();
        for (const command of commands) {
            const providedTask: CheTaskConfiguration = {
                type: CHE_TASK_TYPE,
                label: `${command.name}`,
                command: command.commandLine,
                previewUrl: this.getCommandAttribute(command, 'previewUrl')
            };
            tasks.push(providedTask);
        }
        return tasks;
    }

    protected getCommandAttribute(command: ICommand, attrName: string): string | undefined {
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
