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
import { QuickOpenService, QuickOpenModel, QuickOpenItem, QuickOpenMode } from '@theia/core/lib/browser/quick-open/';
import { CheWorkspaceClient } from '../common/che-workspace-client';

@injectable()
export class MachinePicker implements QuickOpenModel {

    @inject(CheWorkspaceClient)
    protected readonly cheWorkspaceClient: CheWorkspaceClient;

    @inject(QuickOpenService)
    protected readonly quickOpenService: QuickOpenService;

    protected items: QuickOpenItem[];

    /**
     * Returns a machine name if there's just one machine in the current workspace.
     * Shows a quick open widget allows to pick a machine if there are several ones.
     */
    async pick(): Promise<string> {
        this.items = [];

        const machines = await this.getMachines();
        if (machines.length === 1) {
            return machines[0];
        }

        const promise = new Promise<string>((resolve, reject) => {
            for (const machineName of machines) {
                this.items.push(new MachineQuickOpenItem(machineName, resolve));
            }
        });

        this.quickOpenService.open(this, {
            placeholder: 'Pick a machine to run the task'
        });

        return promise;
    }

    onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
        acceptor(this.items);
    }

    protected async getMachines(): Promise<string[]> {
        const machineNames: string[] = [];
        const machines = await this.cheWorkspaceClient.getMachines();
        for (const machineName in machines) {
            machineNames.push(machineName);
        }
        return machineNames;
    }
}

export class MachineQuickOpenItem extends QuickOpenItem {

    constructor(
        protected readonly machineName: string,
        protected readonly runFunc: (p: string | PromiseLike<string> | undefined) => void
    ) {
        super({ label: machineName });
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        this.runFunc(this.machineName);
        return true;
    }
}
