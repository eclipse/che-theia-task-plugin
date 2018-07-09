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
import { TaskConfiguration } from '@theia/task/lib/common';
import { Task, TaskRunner, TaskManager } from '@theia/task/lib/node';
import { TaskFactory } from './che-task';
import { MachineExecClientFactory } from './machine-exec-client';

/**
 * Sends a task for execution to machine-exec server.
 */
@injectable()
export class CheTaskRunner implements TaskRunner {

    @inject(MachineExecClientFactory)
    protected readonly machineExecClientFactory: MachineExecClientFactory;

    @inject(MachineExecClientFactory)
    protected readonly execAttachClientFactory: MachineExecClientFactory;

    @inject(TaskManager)
    protected readonly taskManager: TaskManager;

    @inject(TaskFactory)
    protected readonly taskFactory: TaskFactory;

    /**
     * Runs a task from the given task configuration which must have a target property specified.
     */
    async run(taskConfig: TaskConfiguration, ctx?: string): Promise<Task> {
        if (!taskConfig.target) {
            throw new Error(`Che task config must have 'target' property specified`);
        }
        if (!taskConfig.target.workspaceId) {
            throw new Error(`Che task config must have 'target.workspaceId' property specified`);
        }
        if (!taskConfig.target.machineName) {
            throw new Error(`Che task config must have 'target.machineName' property specified`);
        }

        const machineExec = {
            identifier: {
                machineName: taskConfig.target.machineName,
                workspaceId: taskConfig.target.workspaceId
            },
            cmd: ['sh', '-c', taskConfig.command],
            tty: true
        };

        let execId = 0;
        try {
            const execCreateClient = this.machineExecClientFactory.createExecClient();
            execId = await execCreateClient.create(machineExec);

            const execAttachClient = this.execAttachClientFactory.createAttachClient(execId);
            execAttachClient.attach();

            return this.taskFactory({
                label: taskConfig.label,
                context: ctx,
                execId: execId,
                config: taskConfig
            });
        } catch (err) {
            throw new Error(`Failed to execute Che command: ${err}`);
        }
    }
}
