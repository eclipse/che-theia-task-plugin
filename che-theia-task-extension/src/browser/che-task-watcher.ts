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

    onStart(): void {
        // wait for the workspace root to be set    
        this.workspaceService.root.then(async root => {
            if (root) {
                this.workspaceRootUri = root.uri;
            }
        });

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
