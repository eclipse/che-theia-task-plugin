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

import { TaskConfiguration, TaskInfo } from '@theia/task/lib/common';

export const CHE_TASK_TYPE = 'che';

export interface CheTaskConfiguration extends TaskConfiguration {
    readonly type: 'che',
    readonly command: string,
    readonly target?: Target,
    readonly previewUrl?: string
}

export interface Target {
    workspaceId?: string,
    machineName?: string
}

export interface CheTaskInfo extends TaskInfo {
    readonly execId: number;
}
