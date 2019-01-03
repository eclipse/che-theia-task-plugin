/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, postConstruct, inject } from 'inversify';
import WorkspaceClient, { IRemoteAPI, IWorkspace, IServer, IRestAPIConfig, IMachine, ICommand } from '@eclipse-che/workspace-client';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables/env-variables-protocol';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { CheApiEndPointProvider } from '../common/che-api-endpoint-provider';
import { CheWorkspaceClientService } from '../common/che-workspace-client-service';

@injectable()
export class CheWorkspaceClientServiceImpl implements CheWorkspaceClientService {

    private deferredRestApiClient = new Deferred<IRemoteAPI>();

    @inject(EnvVariablesServer)
    protected readonly envVariablesServer: EnvVariablesServer;

    @inject(CheApiEndPointProvider)
    protected readonly cheApiEndPointProvider: CheApiEndPointProvider;

    @postConstruct()
    protected async init() {
        const cheApiEndpoint = await this.cheApiEndPointProvider.getCheApiEndPoint();

        if (!cheApiEndpoint) {
            throw new Error(`Environment variable ${this.cheApiEndPointProvider.getCheApiEndPointEnvVariableName()} is not set.`);
        }

        const restAPIConfig: IRestAPIConfig = {
            baseUrl: cheApiEndpoint,
            headers: {}
        };

        const machineToken = await this.getMachineToken();
        if (machineToken) {
            restAPIConfig.headers['Authorization'] = "Bearer " + machineToken;
        }

        this.deferredRestApiClient.resolve(WorkspaceClient.getRestApi(restAPIConfig));
    }

    protected get restApiClient(): Promise<IRemoteAPI> {
        return this.deferredRestApiClient.promise;
    }

    async getMachineExecServerURL(): Promise<string> {
        const machineExecServer = await this.getMachineExecServer();
        if (!machineExecServer) {
            throw new Error('No server with type "terminal" found.');
        }
        return machineExecServer.url;
    }

    protected async getMachineExecServer(): Promise<IServer | undefined> {
        const machines = await this.getMachines();
        for (const machineName in machines) {
            if (!machines.hasOwnProperty(machineName)) {
                continue;
            }
            const servers = machines[machineName].servers;
            for (const serverName in servers) {
                if (!servers.hasOwnProperty(serverName)) {
                    continue;
                }
                const serverAttributes = servers[serverName].attributes;
                if (serverAttributes && serverAttributes['type'] === 'terminal') {
                    return servers[serverName];
                }
            }
        }
        return undefined;
    }

    async getMachines(): Promise<{ [attrName: string]: IMachine }> {
        const workspace = await this.getCurrentWorkspace();
        if (!workspace.runtime) {
            throw new Error('Workspace is not running.');
        }

        return workspace.runtime.machines;
    }

    async getCommands(): Promise<ICommand[]> {
        let commands: any;
        const workspace = await this.getCurrentWorkspace();
        if (workspace.runtime) {
            commands = workspace.runtime.commands;
        } else {
            commands = workspace.config.commands;
        }
        return commands ? commands : [];
    }

    async getCurrentWorkspace(): Promise<IWorkspace> {
        const workspaceId = await this.getWorkspaceId();
        console.log(workspaceId);
        if (!workspaceId) {
            throw new Error('Environment variable CHE_WORKSPACE_ID is not set.');
        }
        const apiClient = await this.restApiClient;
        return await apiClient.getById<IWorkspace>(workspaceId);
    }

    async getWorkspaceId(): Promise<string | undefined> {
        return await this.getEnvVarValue('CHE_WORKSPACE_ID');
    }

    private async getMachineToken(): Promise<string | undefined> {
        return await this.getEnvVarValue("CHE_MACHINE_TOKEN");
    }

    protected async getEnvVarValue(envVar: string): Promise<string | undefined> {
        const variable = await this.envVariablesServer.getValue(envVar);
        return variable && variable.value ? variable.value : undefined;
    }
}
