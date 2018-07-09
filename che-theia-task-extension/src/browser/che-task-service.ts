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
