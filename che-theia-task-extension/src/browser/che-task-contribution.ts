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
