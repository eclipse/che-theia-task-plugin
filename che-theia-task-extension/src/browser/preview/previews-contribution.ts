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
import { AbstractViewContribution, FrontendApplicationContribution, FrontendApplication, StatusBar, StatusBarAlignment } from '@theia/core/lib/browser';
import { PreviewsWidget } from './previews-widget';

export const PREVIEWS_WIDGET_FACTORY_ID = 'previewUrlsView';

/** Contributes `Preview URLs` view. */
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
            toggleCommandId: 'previewUrlsView:toggle',
        });
    }

    onStart(app: FrontendApplication) {
        this.setStatusBarElement();
    }

    protected setStatusBarElement() {
        this.statusBar.setElement('che-previews', {
            text: '$(link) Previews',
            alignment: StatusBarAlignment.LEFT,
            tooltip: 'Show Preview URLs',
            command: this.toggleCommand ? this.toggleCommand.id : undefined
        });
    }
}
