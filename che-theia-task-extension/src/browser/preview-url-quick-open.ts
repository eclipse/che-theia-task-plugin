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

import { inject, injectable } from 'inversify';
import { QuickOpenService, QuickOpenModel, QuickOpenItem, QuickOpenMode } from '@theia/core/lib/browser/quick-open/';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { TaskService } from '@theia/task/lib/browser';
import { TaskConfigurations } from '@theia/task/lib/browser/task-configurations';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../common/task-protocol';

@injectable()
export class PreviewUrlQuickOpen implements QuickOpenModel {

    @inject(TaskService)
    protected readonly taskService: TaskService;

    @inject(TaskConfigurations)
    protected readonly taskConfigurations: TaskConfigurations;

    @inject(QuickOpenService)
    protected readonly quickOpenService: QuickOpenService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(VariableResolverService)
    protected readonly variableResolverService: VariableResolverService;

    protected items: QuickOpenItem[];

    async open(): Promise<void> {
        this.items = [];

        const tasks = await this.getCheTasks();
        for (const task of tasks) {
            if (task.previewUrl) {
                const resolvedURL = await this.variableResolverService.resolve(task.previewUrl);
                this.items.push(new PreviewURLQuickOpenItem(this.windowService, task.label, resolvedURL));
            }
        }

        this.quickOpenService.open(this, {
            placeholder: this.items.length ? 'Pick the URL you want to go to' : 'No Che tasks are running',
            fuzzyMatchLabel: true,
            fuzzyMatchDescription: true,
            fuzzySort: true
        });
    }

    onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
        acceptor(this.items);
    }

    /** Returns configurations for Che tasks with a preview URL defined. */
    protected async getCheTasks(): Promise<CheTaskConfiguration[]> {
        const cheTasks: CheTaskConfiguration[] = [];
        const runningTasks = await this.taskService.getRunningTasks();
        runningTasks.filter(t => t.config.type === CHE_TASK_TYPE).forEach(cheTask => {
            const cheTaskConfig = cheTask.config as CheTaskConfiguration;
            if (cheTaskConfig.previewUrl) {
                cheTasks.push(cheTaskConfig);
            }
        });
        return cheTasks;
    }
}

export class PreviewURLQuickOpenItem extends QuickOpenItem {

    constructor(
        protected readonly windowService: WindowService,
        protected readonly taskLabel: string,
        protected readonly previewURL: string
    ) {
        super();
    }

    getLabel(): string {
        return this.previewURL;
    }

    getDescription(): string {
        return this.taskLabel;
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        if (this.previewURL) {
            this.windowService.openNewWindow(this.previewURL);
        }
        return true;
    }
}
