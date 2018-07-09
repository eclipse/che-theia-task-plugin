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

import { injectable, inject, postConstruct } from 'inversify';
import { WebSocketConnectionProvider } from './messaging/ws-connection-provider';
import { CheWorkspaceClient } from '../common/che-workspace-client';

export interface MachineIdentifier {
    workspaceId: string,
    machineName: string
}
export interface MachineExec {
    identifier: MachineIdentifier,
    cmd: string[],
    tty: boolean,
    id?: number
}

/** An interface for a JSON-RPC client for creating exec in a machine-exec server. */
export interface ExecCreateClient {
    create(exec: MachineExec): Promise<number>;
}

/** An interface for a JSON-RPC client for attaching to a previously created exec. */
export interface ExecAttachClient {
    attach(): Promise<void>;
}

@injectable()
export class MachineExecClientFactory {

    private machineExecServerEndpoint: string;
    private execClient: ExecCreateClient;

    @inject(WebSocketConnectionProvider)
    protected readonly wsConnectionProvider: WebSocketConnectionProvider;

    @inject(CheWorkspaceClient)
    protected readonly cheWorkspaceClient: CheWorkspaceClient;

    @postConstruct()
    protected async init() {
        this.machineExecServerEndpoint = await this.cheWorkspaceClient.getMachineExecServerURL();
    }

    createExecClient(): ExecCreateClient {
        if (!this.machineExecServerEndpoint) {
            throw new Error('Machine-exec server is not found in the current workspace.');
        }
        if (!this.execClient) {
            this.execClient = this.wsConnectionProvider.createProxy<ExecCreateClient>(`${this.machineExecServerEndpoint}/connect`);
        }
        return this.execClient;
    }

    createAttachClient(id: number): ExecAttachClient {
        if (!this.machineExecServerEndpoint) {
            throw new Error('Machine-exec server is not found in the current workspace.');
        }
        return this.wsConnectionProvider.createProxy<ExecAttachClient>(`${this.machineExecServerEndpoint}/attach/${id}`);
    }
}
