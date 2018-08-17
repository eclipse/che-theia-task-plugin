/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject, named } from 'inversify';
import { ILogger } from '@theia/core/lib/common/logger';
import { Task, TaskOptions, TaskManager } from '@theia/task/lib/node';
import { CheTaskInfo } from '../common/task-protocol';

export const TaskCheOptions = Symbol('TaskCheOptions');
export interface TaskCheOptions extends TaskOptions {
    execId: number
}

export const TaskFactory = Symbol('TaskFactory');
export type TaskFactory = (options: TaskCheOptions) => CheTask;

@injectable()
export class CheTask extends Task {

    constructor(
        @inject(TaskManager) protected readonly taskManager: TaskManager,
        @inject(ILogger) @named('task') protected readonly logger: ILogger,
        @inject(TaskCheOptions) protected readonly options: TaskCheOptions
    ) {
        super(taskManager, logger, options);
        this.logger.info(`Created new Che task, id: ${this.id}, exec id: ${this.options.execId}, context: ${this.context}`);
    }

    kill(): Promise<void> {
        throw new Error('Stopping a Che task currently is not supported.');
    }

    getRuntimeInfo(): CheTaskInfo {
        return {
            taskId: this.id,
            ctx: this.options.context,
            config: this.options.config,
            execId: this.options.execId
        };
    }
}
