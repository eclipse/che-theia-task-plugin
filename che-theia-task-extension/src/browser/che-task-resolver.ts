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
import { TaskResolver } from '@theia/task/lib/browser';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { TaskConfiguration } from '@theia/task/lib/common';
import { MachinePicker } from './machine-picker';
import { CheTaskConfiguration, Target, CHE_TASK_TYPE } from '../common/task-protocol';
import { CheWorkspaceClient } from '../common/che-workspace-client';

/**
 * Prepares a Che Task config for execution:
 * - resolves the variables in a command line;
 * - sets the current Che workspace's ID if it's not specified;
 * - allows to choose a target machine if it's not specified.
 */
@injectable()
export class CheTaskResolver implements TaskResolver {

    @inject(VariableResolverService)
    protected readonly variableResolverService: VariableResolverService;

    @inject(CheWorkspaceClient)
    protected readonly cheWorkspaceClient: CheWorkspaceClient;

    @inject(MachinePicker)
    protected readonly machineQuickOpen: MachinePicker;

    async resolveTask(taskConfig: TaskConfiguration): Promise<TaskConfiguration> {
        if (taskConfig.type !== CHE_TASK_TYPE) {
            throw new Error(`Unsupported task configuration type: ${taskConfig.type}`);
        }
        const cheTaskConfig = taskConfig as CheTaskConfiguration;
        const resultTarget: Target = {};

        if (!cheTaskConfig.target) {
            resultTarget.workspaceId = await this.cheWorkspaceClient.getWorkspaceId();
            resultTarget.machineName = await this.machineQuickOpen.pick();
        } else {
            const target = cheTaskConfig.target;
            resultTarget.workspaceId = target.workspaceId ? target.workspaceId : await this.cheWorkspaceClient.getWorkspaceId();
            resultTarget.machineName = target.machineName ? target.machineName : await this.machineQuickOpen.pick();
        }

        const resultTask: CheTaskConfiguration = {
            type: cheTaskConfig.type,
            label: cheTaskConfig.label,
            command: await this.variableResolverService.resolve(cheTaskConfig.command),
            target: resultTarget,
            previewUrl: cheTaskConfig.previewUrl
        };
        return resultTask;
    }
}
