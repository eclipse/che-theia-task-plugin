/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { IWorkspace, IMachine, ICommand } from '@eclipse-che/workspace-client';

export const cheWorkspaceClientServicePath = "/services/ws-client";

export const CheWorkspaceClientService = Symbol('CheWorkspaceClientService');
export interface CheWorkspaceClientService {
    getMachineExecServerURL(): Promise<string>;

    getMachines(): Promise<{ [attrName: string]: IMachine }>;

    getCommands(): Promise<ICommand[]>;

    getCurrentWorkspace(): Promise<IWorkspace>;

    getWorkspaceId(): Promise<string | undefined>;
}
