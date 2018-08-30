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
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { TaskService } from '@theia/task/lib/browser';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import * as React from 'react';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../../common/task-protocol';

/** Displays the preview URLs for all running Che tasks. */
@injectable()
export class PreviewsWidget extends ReactWidget {

    @inject(TaskService)
    protected readonly taskService: TaskService;

    @inject(VariableResolverService)
    protected readonly variableResolverService: VariableResolverService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    protected readonly urls: string[];

    constructor() {
        super();
        this.id = 'previewUrls';
        this.addClass('previews');
        this.title.label = 'Preview URLs';
        this.title.iconClass = 'fa fa-link';
        this.title.closable = true;
        this.urls = [];
    }

    @postConstruct()
    protected init(): void {
        this.fetchUrls().then(() => this.update());
    }

    protected async fetchUrls(): Promise<void> {
        for (const task of await this.getCheTasks()) {
            const resolvedURL = await this.variableResolverService.resolve(task.previewUrl!);
            this.urls.push(resolvedURL);
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
        return <React.Fragment>{this.renderPreviewsContents()}</React.Fragment>;
    }

    protected renderPreviewsContents(): React.ReactNode {
        return <div className='container'>{this.renderURLs()}</div>;
    }

    protected renderURLs(): React.ReactNode[] {
        return this.urls.map(url =>
            <div className='row'>
                <span className='url'>{url}</span>
                <button className='theia-button'
                    onClick={event => {
                        this.windowService.openNewWindow(url);
                    }}>Open</button>
            </div>);
    }
}
