/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { che } from '@eclipse-che/api';

export const cheWorkspaceClientServicePath = "/services/ws-client";

export const CheWorkspaceClientService = Symbol('CheWorkspaceClientService');
export interface CheWorkspaceClientService {
    getMachineExecServerURL(): Promise<string>;

    getMachines(): Promise<{ [attrName: string]: che.workspace.Machine }>;

    getCommands(): Promise<che.workspace.Command[]>;

    getCurrentWorkspace(): Promise<che.workspace.Workspace>;

    getWorkspaceId(): Promise<string | undefined>;
}
