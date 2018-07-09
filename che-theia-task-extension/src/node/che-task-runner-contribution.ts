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
