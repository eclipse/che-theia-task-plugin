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
import { TaskService } from '@theia/task/lib/browser';
import { CHE_TASK_TYPE } from '../common/task-protocol';

@injectable()
export class CheTaskService {

    @inject(TaskService)
    protected readonly taskService: TaskService;

    run(label: string): void {
        this.taskService.run(CHE_TASK_TYPE, label);
    }
}
