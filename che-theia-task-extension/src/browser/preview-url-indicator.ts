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
