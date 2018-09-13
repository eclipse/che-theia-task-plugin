/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { inject, injectable, postConstruct } from 'inversify';
import { Emitter, Event } from '@theia/core';
import { DefaultFrontendApplicationContribution } from '@theia/core/lib/browser';
import { TaskService } from '@theia/task/lib/browser';
import { TaskWatcher } from '@theia/task/lib/common';
import { PreviewUrlOpenService } from './preview-url-open-service';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../../common/task-protocol';

@injectable()
export class PreviewsWidgetModel extends DefaultFrontendApplicationContribution {

    @inject(TaskService)
    protected readonly taskService: TaskService;

    @inject(TaskWatcher)
    protected readonly taskWatcher: TaskWatcher;

    @inject(PreviewUrlOpenService)
    protected readonly previewService: PreviewUrlOpenService;

    protected tasks: CheTaskConfiguration[] = [];

    protected readonly onChangedEmitter = new Emitter<void>();

    @postConstruct()
    init(): void {
        this.fetchTasks();
        this.taskWatcher.onTaskCreated(() => this.fetchTasks());
        this.taskWatcher.onTaskExit(() => this.fetchTasks());
    }

    protected async fetchTasks(): Promise<void> {
        this.tasks = [];
        const runningTasks = await this.taskService.getRunningTasks();
        runningTasks.filter(t => t.config.type === CHE_TASK_TYPE).forEach(cheTask => {
            const cheTaskConfig = cheTask.config as CheTaskConfiguration;
            if (cheTaskConfig.previewUrl) {
                this.tasks.push(cheTaskConfig);
            }
        });
        this.fireChanged();
    }

    getTasks(): CheTaskConfiguration[] {
        return this.tasks;
    }

    get onChanged(): Event<void> {
        return this.onChangedEmitter.event;
    }

    protected fireChanged(): void {
        this.onChangedEmitter.fire(undefined);
    }

    previewURL(task: CheTaskConfiguration): void {
        this.previewService.preview(task);
    }

    goToURL(task: CheTaskConfiguration): void {
        this.previewService.preview(task, true);
    }
}
