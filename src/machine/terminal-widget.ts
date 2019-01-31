/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { injectable, inject } from "inversify";
import * as theia from '@theia/plugin';
import { MachineExecClient } from "./machine-exec-client";

export const TerminalWidgetFactory = Symbol('TerminalWidgetFactory');
export interface TerminalWidgetFactory {
    createWidget(options: CheTerminalWidgetOptions): Promise<CheTerminalWidget>;
}

export const CheTerminalWidgetOptions = Symbol('CheTerminalWidgetOptions');
export interface CheTerminalWidgetOptions {
    title: string;
    terminalId: number;
}

@injectable()
export class CheTerminalWidget {

    @inject(MachineExecClient)
    protected readonly machineExecClient!: MachineExecClient;

    @inject(CheTerminalWidgetOptions)
    protected readonly options!: CheTerminalWidgetOptions;

    async connectTerminalProcess(): Promise<void> {
        const outputChannel = theia.window.createOutputChannel(this.options.title);
        outputChannel.show();

        this.machineExecClient.connectTerminalProcess(this.options.terminalId, {
            onMessage: content => {
                outputChannel.appendLine(content);
            }
        });
    }
}
