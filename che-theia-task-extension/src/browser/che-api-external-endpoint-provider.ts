/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject } from 'inversify';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables/env-variables-protocol';
import { CheApiEndPointProvider } from '../common/che-api-endpoint-provider';

@injectable()
export class CheApiExternalEndPointProvider implements CheApiEndPointProvider {

    @inject(EnvVariablesServer)
    protected readonly envVariablesServer: EnvVariablesServer;

    getCheApiEndPoint(): Promise<string | undefined> {
        return this.getEnvVarValue(this.getCheApiEndPointEnvVariableName());
    }

    getCheApiEndPointEnvVariableName(): string {
        return 'CHE_API_EXTERNAL';
    }

    protected async getEnvVarValue(envVar: string): Promise<string | undefined> {
        const variable = await this.envVariablesServer.getValue(envVar);
        return variable && variable.value ? variable.value : undefined;
    }

}
