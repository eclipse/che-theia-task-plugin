/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { ContainerModule, Container } from 'inversify';
import { TaskRunner, TaskRunnerContribution } from '@theia/task/lib/node';
import { TaskFactory, TaskCheOptions, CheTask } from './che-task';
import { CheTaskRunner } from './che-task-runner';
import { CheTaskRunnerContribution } from './che-task-runner-contribution';
import { MachineExecClientFactory } from './machine-exec-client';
import { JsonRpcProxyProvider } from './json-rpc-proxy-provider';
import { CheWorkspaceClientService, cheWorkspaceClientServicePath } from '../common/che-workspace-client-service';
import { CheApiEndPointProvider } from '../common/che-api-endpoint-provider';
import { CheApiExternalEndPointProvider } from '../common/che-api-external-endpoint-provider';
import { CheWorkspaceClientServiceImpl } from './che-workspace-client';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';

export default new ContainerModule(bind => {
    bind(CheWorkspaceClientServiceImpl).toSelf().inSingletonScope();
    bind(CheWorkspaceClientService).to(CheWorkspaceClientServiceImpl).inSingletonScope();
     bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(cheWorkspaceClientServicePath, () =>
            ctx.container.get(CheWorkspaceClientService)
        )
    );

    bind(JsonRpcProxyProvider).toSelf().inSingletonScope();
    bind(MachineExecClientFactory).toSelf().inSingletonScope();

    bind(CheApiEndPointProvider).to(CheApiExternalEndPointProvider).inSingletonScope();

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
