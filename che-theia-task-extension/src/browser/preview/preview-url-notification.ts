/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { inject, injectable } from 'inversify';
import { MessageService } from '@theia/core';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { TaskWatcher, TaskInfo } from '@theia/task/lib/common';
import { PREVIEW_ACTION, GO_TO_ACTION } from './previews-widget';
import { PreviewUrlService } from './preview-url-service';
import { CheTaskPreferences } from '../task-preferences';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../../common/task-protocol';

@injectable()
export class PreviewUrlNotification implements FrontendApplicationContribution {

    @inject(TaskWatcher)
    protected readonly taskWatcher: TaskWatcher;

    @inject(CheTaskPreferences)
    protected readonly taskPreferences: CheTaskPreferences;

    @inject(PreviewUrlService)
    protected readonly previewService: PreviewUrlService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    onStart(): void {
        this.taskWatcher.onTaskCreated(event => this.onTaskCreated(event));
    }

    protected onTaskCreated = async (event: TaskInfo) => {
        const notify = this.taskPreferences['che.task.preview.notifications'];
        if (event.config.type !== CHE_TASK_TYPE || !event.config.previewUrl || notify === 'off') {
            return;
        }

        const cheTask = event.config as CheTaskConfiguration;
        if (notify === 'alwaysGoTo') {
            this.previewService.preview(cheTask, true);
        } else if (notify === 'alwaysPreview') {
            this.previewService.preview(cheTask);
        } else {
            const answer = await this.messageService.info(`Task '${cheTask.label}' launched a service on ${cheTask.previewUrl}`, PREVIEW_ACTION, GO_TO_ACTION);
            if (answer) {
                this.previewService.preview(cheTask, answer === GO_TO_ACTION);
            }
        }
    }
}
