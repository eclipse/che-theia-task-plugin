/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject, postConstruct } from 'inversify';
import { Message } from '@phosphor/messaging';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { TaskService } from '@theia/task/lib/browser';
import { PREVIEW_ACTION, GO_TO_ACTION } from './previews-contribution';
import { PreviewUrlService } from './preview-url-service';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../../common/task-protocol';
import * as React from 'react';

/** Displays the preview URLs of all running Che tasks. */
@injectable()
export class PreviewsWidget extends ReactWidget {

    @inject(TaskService)
    protected readonly taskService: TaskService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(PreviewUrlService)
    protected readonly previewService: PreviewUrlService;

    protected tasks: CheTaskConfiguration[] = [];

    constructor() {
        super();
        this.id = 'previewUrls';
        this.addClass('preview-urls');
        this.title.label = 'Preview URLs';
        this.title.iconClass = 'fa fa-link';
        this.title.closable = true;
    }

    @postConstruct()
    protected init(): void {
        this.refresh();
    }

    /** Refresh the widget. */
    async refresh(): Promise<void> {
        await this.fetchURLs();
        this.update();
    }

    // TODO: Widget was activated, but did not accept focus: previewUrls
    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
        this.update();
    }

    protected async fetchURLs(): Promise<void> {
        this.tasks = [];
        for (const task of await this.getCheTasks()) {
            if (task.previewUrl) {
                this.tasks.push(task);
            }
        }
    }

    /** Returns the configurations for Che tasks with a preview URL defined. */
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

    protected render(): React.ReactNode {
        if (this.tasks.length === 0) {
            return <React.Fragment>{this.renderPlaceholder()}</React.Fragment>;
        }
        return <React.Fragment>{this.renderPreviewsContents()}</React.Fragment>;
    }

    protected renderPlaceholder(): React.ReactNode {
        return <div className='container placeholder'>No Che tasks with a preview URL are running</div>;
    }

    protected renderPreviewsContents(): React.ReactNode {
        return <div className='container'>{this.renderURLs()}</div>;
    }

    protected renderURLs(): React.ReactNode[] {
        return this.tasks.map((task, idx) =>
            <div key={task.label + idx} className='url-container'>
                <span key='link' className='link'>{task.previewUrl!}</span>
                <span key='label' className='label'>{task.label}</span>
                <div key='actions' className='actions-container'>
                    {this.renderActions(task)}
                </div>
            </div>);
    }

    protected renderActions(task: CheTaskConfiguration): React.ReactNode[] {
        return [
            <button key='preview-url' className='theia-button' onClick={() => this.previewService.preview(task)}>{PREVIEW_ACTION}</button>,
            <button key='goto-url' className='theia-button' onClick={() => this.previewService.preview(task, true)}>{GO_TO_ACTION}</button>
        ];
    }
}
