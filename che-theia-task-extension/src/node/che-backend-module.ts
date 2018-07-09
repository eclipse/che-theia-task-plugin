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

import { ContainerModule, Container } from 'inversify';
import { TaskRunner, TaskRunnerContribution } from '@theia/task/lib/node';
import { TaskFactory, TaskCheOptions, CheTask } from './che-task';
import { CheTaskRunner } from './che-task-runner';
import { CheTaskRunnerContribution } from './che-task-runner-contribution';
import { MachineExecClientFactory } from './machine-exec-client';
import { WebSocketConnectionProvider } from './messaging/ws-connection-provider';
import { CheWorkspaceClient } from '../common/che-workspace-client';

export default new ContainerModule(bind => {
    bind(CheWorkspaceClient).toSelf().inSingletonScope();

    bind(WebSocketConnectionProvider).toSelf().inSingletonScope();
    bind(MachineExecClientFactory).toSelf().inSingletonScope();

    bind(CheTaskRunner).toSelf().inSingletonScope();
    bind(TaskRunner).to(CheTaskRunner).inSingletonScope();
    bind(TaskRunnerContribution).to(CheTaskRunnerContribution).inSingletonScope();

    bind(CheTask).toSelf().inTransientScope();
    bind(TaskFactory).toFactory(ctx =>
        (options: TaskCheOptions) => {
            const child = new Container({ defaultScope: 'Singleton' });
            child.parent = ctx.container;
            child.bind(TaskCheOptions).toConstantValue(options);
            return child.get(CheTask);
        }
    );
});
