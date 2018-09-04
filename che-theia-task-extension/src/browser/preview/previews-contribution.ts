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
import { MessageService } from '@theia/core';
import { AbstractViewContribution, FrontendApplicationContribution, FrontendApplication, StatusBar, StatusBarAlignment } from '@theia/core/lib/browser';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { TaskWatcher, TaskInfo } from '@theia/task/lib/common';
import { PreviewUrlService } from './preview-url-service';
import { PreviewsWidget } from './previews-widget';
import { CHE_TASK_TYPE, CheTaskConfiguration } from '../../common/task-protocol';

export const PREVIEWS_WIDGET_FACTORY_ID = 'previewUrlsView';
export const PREVIEW_ACTION = 'Preview';
export const GO_TO_ACTION = 'Go to';

/** Contributes a functionality to work with the preview URLs. */
@injectable()
export class PreviewsContribution extends AbstractViewContribution<PreviewsWidget> implements FrontendApplicationContribution {

    @inject(StatusBar)
    protected readonly statusBar: StatusBar;

    @inject(TaskWatcher)
    protected readonly taskWatcher: TaskWatcher;

    @inject(PreviewsWidget)
    protected previewsWidget: PreviewsWidget;

    @inject(MessageService)
    protected messageService: MessageService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(PreviewUrlService)
    protected readonly previewService: PreviewUrlService;

    constructor() {
        super({
            widgetId: PREVIEWS_WIDGET_FACTORY_ID,
            widgetName: 'Preview URLs',
            defaultWidgetOptions: {
                area: 'bottom'
            },
            toggleCommandId: 'previewUrlsView:toggle',
        });
    }

    onStart(app: FrontendApplication) {
        this.setStatusBarElement();
        this.startWatchingTasks();
    }

    protected setStatusBarElement() {
        this.statusBar.setElement('che-previews', {
            text: '$(link) Previews',
            tooltip: 'Show Preview URLs',
            alignment: StatusBarAlignment.LEFT,
            command: this.toggleCommand ? this.toggleCommand.id : undefined
        });
    }

    protected async startWatchingTasks(): Promise<void> {
        this.taskWatcher.onTaskCreated(event => this.onTaskCreated(event));
        this.taskWatcher.onTaskExit(() => this.previewsWidget.refresh());
    }

    protected onTaskCreated = async (event: TaskInfo) => {
        if (event.config.type !== CHE_TASK_TYPE) {
            return;
        }
        this.previewsWidget.refresh();
        const cheTask = event.config as CheTaskConfiguration;
        const previewURL = cheTask.previewUrl;
        if (previewURL) {
            const answer = await this.messageService.info(`Task ${cheTask.label} is running with preview URL ${previewURL}`, PREVIEW_ACTION, GO_TO_ACTION);
            if (answer) {
                this.previewService.preview(cheTask, answer === GO_TO_ACTION);
            }
        }
    }
}
