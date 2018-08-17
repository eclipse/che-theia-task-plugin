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
import { TaskRunnerContribution, TaskRunnerRegistry } from '@theia/task/lib/node';
import { CheTaskRunner } from './che-task-runner';
import { CHE_TASK_TYPE } from '../common/task-protocol';

@injectable()
export class CheTaskRunnerContribution implements TaskRunnerContribution {

    @inject(CheTaskRunner)
    protected readonly cheTaskRunner: CheTaskRunner;

    registerRunner(runners: TaskRunnerRegistry): void {
        runners.registerRunner(CHE_TASK_TYPE, this.cheTaskRunner);
    }
}
