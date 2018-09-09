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
import { AbstractViewContribution, StatusBar, StatusBarAlignment, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { PreviewsWidget, PREVIEWS_WIDGET_FACTORY_ID } from './previews-widget';

export const STATUS_BAR_ELEMENT_ID: string = 'che-previews';

@injectable()
export class PreviewsContribution extends AbstractViewContribution<PreviewsWidget> implements FrontendApplicationContribution {

    @inject(StatusBar)
    protected readonly statusBar: StatusBar;

    constructor() {
        super({
            widgetId: PREVIEWS_WIDGET_FACTORY_ID,
            widgetName: 'Preview URLs',
            defaultWidgetOptions: {
                area: 'bottom'
            },
            toggleCommandId: 'previewURLsView:toggle',
        });
    }

    onStart(): void {
        this.setStatusBarElement();
    }

    protected setStatusBarElement(): void {
        this.statusBar.setElement(STATUS_BAR_ELEMENT_ID, {
            text: '$(link) Previews',
            tooltip: 'Show Preview URLs',
            alignment: StatusBarAlignment.LEFT,
            command: this.toggleCommand ? this.toggleCommand.id : undefined
        });
    }
}
