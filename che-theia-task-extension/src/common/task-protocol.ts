/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

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
