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
import { TaskInfo, TaskWatcher } from '@theia/task/lib/common';
import { FrontendApplicationContribution, WidgetManager, ApplicationShell } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { CHE_TERMINAL_WIDGET_FACTORY_ID, CheTerminalWidget, CheTerminalWidgetFactoryOptions } from './che-terminal-widget';
import { CheTaskInfo, CHE_TASK_TYPE } from '../common/task-protocol';

@injectable()
export class CheTaskWatcher implements FrontendApplicationContribution {

    protected workspaceRootUri: string | undefined = undefined;

    @inject(TaskWatcher)
    protected readonly taskWatcher: TaskWatcher;

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    async onStart() {
        // wait for the workspace root to be set
        const wsRoot = await this.workspaceService.roots;
        // WIP workspace folder is roots[0] https://github.com/theia-ide/theia/commit/80f402c621fe197130eae7abd22a0d89008b4ef1
        // Beware, workspace folder concept will diseappear in the next PR.
        this.workspaceRootUri = wsRoot[0].uri;

        this.taskWatcher.onTaskCreated((event: TaskInfo) => {
            if (this.isEventForThisClient(event.ctx)) {
                if (event.config.type === CHE_TASK_TYPE) {
                    this.attach((event as CheTaskInfo).execId, event.config.label);
                }
            }
        });
    }

    protected isEventForThisClient(context: string | undefined): boolean {
        return context === this.workspaceRootUri;
    }

    protected async attach(terminalId: number, taskLabel: string): Promise<void> {
        const widget = <CheTerminalWidget>await this.widgetManager.getOrCreateWidget(
            CHE_TERMINAL_WIDGET_FACTORY_ID,
            <CheTerminalWidgetFactoryOptions>{
                taskLabel: taskLabel,
                destroyTermOnClose: true
            });
        this.shell.addWidget(widget, { area: 'bottom' });
        this.shell.activateWidget(widget.id);
        widget.start(terminalId);
    }
}
