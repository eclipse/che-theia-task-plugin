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
import { CommandContribution, CommandRegistry, Command } from '@theia/core';
import { FrontendApplicationContribution, StatusBar, StatusBarEntry, StatusBarAlignment } from '@theia/core/lib/browser';
import { PreviewUrlQuickOpen } from './preview-url-quick-open';

@injectable()
export class PreviewUrlIndicator implements FrontendApplicationContribution, CommandContribution {

    @inject(StatusBar)
    protected readonly statusBar: StatusBar;

    @inject(PreviewUrlQuickOpen)
    protected readonly previewURLQuickOpen: PreviewUrlQuickOpen;

    onStart(): void {
        const element: StatusBarEntry = {
            text: 'Previews',
            alignment: StatusBarAlignment.LEFT,
            tooltip: 'Go to preview URL',
            command: 'che.previewurl.go'
        };
        this.statusBar.setElement('che-preview-url', element);
    }

    registerCommands(commands: CommandRegistry): void {
        const command: Command = {
            id: 'che.previewurl.go',
            label: 'Go to preview URL...'
        };
        commands.registerCommand(command, {
            execute: () => this.previewURLQuickOpen.open()
        });
    }
}
