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
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { PreviewUrlOpenService } from './preview-url-open-service';
import { CheTaskPreferences } from '../task-preferences';
import { CheTaskConfiguration, CHE_TASK_TYPE } from '../../common/task-protocol';

const PREVIEW_ACTION = 'Preview';
const GO_TO_ACTION = 'Go To';

@injectable()
export class PreviewUrlWatcher implements FrontendApplicationContribution {

    @inject(TaskWatcher)
    protected readonly taskWatcher: TaskWatcher;

    @inject(CheTaskPreferences)
    protected readonly taskPreferences: CheTaskPreferences;

    @inject(PreviewUrlOpenService)
    protected readonly previewService: PreviewUrlOpenService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(VariableResolverService)
    protected readonly resolver: VariableResolverService;

    onStart(): void {
        this.taskWatcher.onTaskCreated(event => this.onTaskCreated(event));
    }

    protected onTaskCreated = async (event: TaskInfo) => {
        const mode = this.taskPreferences['che.task.preview.notifications'];
        if (event.config.type !== CHE_TASK_TYPE || !event.config.previewUrl || mode === 'off') {
            return;
        }

        const cheTask = event.config as CheTaskConfiguration;
        if (mode === 'alwaysGoTo') {
            this.previewService.preview(cheTask, true);
        } else if (mode === 'alwaysPreview') {
            this.previewService.preview(cheTask);
        } else {
            this.askUser(cheTask);
        }
    }

    /** Ask a user how the preview URL should be opened. */
    protected async askUser(cheTask: CheTaskConfiguration): Promise<void> {
        const resolvedURL = await this.resolver.resolve(cheTask.previewUrl!);
        const answer = await this.messageService.info(`Task '${cheTask.label}' launched a service on ${resolvedURL}`, PREVIEW_ACTION, GO_TO_ACTION);
        if (answer) {
            this.previewService.preview(cheTask, answer === GO_TO_ACTION);
        }
    }
}
