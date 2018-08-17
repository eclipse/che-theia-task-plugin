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
import { TaskContribution, TaskResolverRegistry, TaskProviderRegistry } from '@theia/task/lib/browser';
import { CheTaskProvider } from './che-task-provider';
import { CheTaskResolver } from './che-task-resolver';
import { CHE_TASK_TYPE } from '../common/task-protocol';

@injectable()
export class CheTaskContribution implements TaskContribution {

    @inject(CheTaskResolver)
    protected readonly taskResolver: CheTaskResolver;

    @inject(CheTaskProvider)
    protected readonly taskProvider: CheTaskProvider;

    registerResolvers(resolvers: TaskResolverRegistry): void {
        resolvers.register(CHE_TASK_TYPE, this.taskResolver);
    }

    registerProviders(providers: TaskProviderRegistry): void {
        providers.register(CHE_TASK_TYPE, this.taskProvider);
    }
}
