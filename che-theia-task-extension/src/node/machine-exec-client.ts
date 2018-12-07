/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject, postConstruct } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { JsonRpcProxyProvider } from './json-rpc-proxy-provider';
import { CheWorkspaceClientService } from '../common/che-workspace-client-service';
import { CONNECT_TERMINAL_SEGMENT, ATTACH_TERMINAL_SEGMENT } from '../common/terminal-protocol';

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

    @inject(JsonRpcProxyProvider)
    protected readonly jsonRpcProxyProvider: JsonRpcProxyProvider;

    @inject(CheWorkspaceClientService)
    protected readonly cheWorkspaceClient: CheWorkspaceClientService;

    @postConstruct()
    protected async init() {
        await this.fetchMachineExecServerURL();
    }

    async fetchMachineExecServerURL(): Promise<void> {
        if (this.machineExecServerEndpoint === undefined) {
            this.machineExecServerEndpoint = await this.cheWorkspaceClient.getMachineExecServerURL();
        }
    }

    createExecClient(): ExecCreateClient {
        if (this.machineExecServerEndpoint === undefined) {
            throw new Error('Machine-exec server is not found in the current workspace.');
        }
        if (!this.execClient) {
            const url = new URI(this.machineExecServerEndpoint).resolve(CONNECT_TERMINAL_SEGMENT);
            this.execClient = this.jsonRpcProxyProvider.createProxy<ExecCreateClient>(url.toString());
        }
        return this.execClient;
    }

    createAttachClient(id: number): ExecAttachClient {
        if (this.machineExecServerEndpoint === undefined) {
            throw new Error('Machine-exec server is not found in the current workspace.');
        }
        const url = new URI(this.machineExecServerEndpoint).resolve(ATTACH_TERMINAL_SEGMENT).resolve(`${id}`);
        return this.jsonRpcProxyProvider.createProxy<ExecAttachClient>(url.toString());
    }
}
