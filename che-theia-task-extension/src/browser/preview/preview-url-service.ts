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
import { WidgetManager, ApplicationShell } from '@theia/core/lib/browser';
import { MiniBrowser, MiniBrowserProps } from '@theia/mini-browser/lib/browser/mini-browser';

@injectable()
export class PreviewUrlService {

    @inject(WidgetManager)
    protected widgetManager: WidgetManager;

    @inject(ApplicationShell)
    protected shell: ApplicationShell;

    /**
     * Open the given URL to preview it in the embedded mini-browser.
     * @param url a URL to preview
     * @param label short description of the given URL. Usually, the related task's label
     */
    async open(url: string, label: string): Promise<void> {
        const widget = <MiniBrowser>await this.widgetManager.getOrCreateWidget(
            MiniBrowser.Factory.ID,
            <MiniBrowserProps>{
                startPage: url,
                name: `Preview - ${label}`
            }
        );
        this.shell.addWidget(widget, { area: 'right' });
        this.shell.activateWidget(widget.id);
    }
}
