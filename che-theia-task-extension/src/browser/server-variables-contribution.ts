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
import { VariableContribution, VariableRegistry } from '@theia/variable-resolver/lib/browser';
import { CheWorkspaceClient } from '../common/che-workspace-client';

/**
 * Contributes the substitution variables, in form of `server.<name>`,
 * which are resolved to the URL of the server of Che machines.
 */
@injectable()
export class ServerVariablesContribution implements VariableContribution {

    @inject(CheWorkspaceClient)
    protected readonly cheWsClient: CheWorkspaceClient;

    async registerVariables(variables: VariableRegistry): Promise<void> {
        const machines = await this.cheWsClient.getMachines();
        for (const machineName in machines) {
            const servers = machines[machineName].servers;
            for (const serverName in servers) {
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
