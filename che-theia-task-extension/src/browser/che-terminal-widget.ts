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

import { injectable, inject } from 'inversify';
import { TerminalWidgetOptions } from '@theia/terminal/lib/browser/base/terminal-widget';
import { TerminalWidgetImpl } from '@theia/terminal/lib/browser/terminal-widget-impl';
import { CheWorkspaceClient } from '../common/che-workspace-client';
import { Disposable } from '@theia/core/lib/common';

export const CHE_TERMINAL_WIDGET_FACTORY_ID = 'che_terminal';

export const CheTerminalWidgetOptions = Symbol('CheTerminalWidgetOptions');
export interface CheTerminalWidgetOptions extends TerminalWidgetOptions {
    taskLabel: string
}

export interface CheTerminalWidgetFactoryOptions extends Partial<CheTerminalWidgetOptions> {
}

const RWS = require('reconnecting-websocket');
const RECONNECTING_OPTIONS = {
    connectionTimeout: 20000,
    maxRetries: 3,
};

/** Extended Theia's terminal widget that connects to Che terminal-exec server. */
@injectable()
export class CheTerminalWidget extends TerminalWidgetImpl {

    @inject(CheWorkspaceClient)
    protected readonly cheWorkspaceClient: CheWorkspaceClient;

    protected async attachTerminal(id: number): Promise<number> {
        return id;
    }

    protected async connectTerminalProcess(): Promise<void> {
        const termServer = await this.cheWorkspaceClient.getMachineExecServerURL();
        const websocketStream = await new RWS(`${termServer}/attach/${this.terminalId}`, [], RECONNECTING_OPTIONS);

        websocketStream.addEventListener('error', (event: Event) => {
            console.error('WebsocketStream error:', event);
        });
        websocketStream.addEventListener('message', (message: any) => {
            this.term.write(message.data);
        });
        this.toDispose.push(Disposable.create(() =>
            websocketStream.close()
        ));
    }
}
