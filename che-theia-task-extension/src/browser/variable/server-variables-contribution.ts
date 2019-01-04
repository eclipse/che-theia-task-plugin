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
import { VariableContribution, VariableRegistry } from '@theia/variable-resolver/lib/browser';
import { CheWorkspaceClientService } from '../../common/che-workspace-client-service';

/**
 * Contributes the substitution variables, in form of `server.<name>`,
 * which are resolved to the URL of the server of Che machines.
 */
@injectable()
export class ServerVariablesContribution implements VariableContribution {

    @inject(CheWorkspaceClientService)
    protected readonly cheWsClient: CheWorkspaceClientService;

    async registerVariables(variables: VariableRegistry): Promise<void> {
        const machines = await this.cheWsClient.getMachines();
        for (const machineName in machines) {
            if (!machines.hasOwnProperty(machineName)) {
                continue;
            }
            const servers = machines[machineName].servers!;
            for (const serverName in servers) {
                if (!servers.hasOwnProperty(serverName)) {
                    continue;
                }
                const url = servers[serverName].url;
                variables.registerVariable({
                    name: `server.${serverName}`,
                    description: url,
                    resolve: () => url
                });
            }
        }
    }
}
