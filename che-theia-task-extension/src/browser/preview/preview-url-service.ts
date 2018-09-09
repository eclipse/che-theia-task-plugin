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
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { MiniBrowser, MiniBrowserProps } from '@theia/mini-browser/lib/browser/mini-browser';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { CheTaskConfiguration } from '../../common/task-protocol';

@injectable()
export class PreviewUrlService {

    @inject(WidgetManager)
    protected widgetManager: WidgetManager;

    @inject(ApplicationShell)
    protected shell: ApplicationShell;

    @inject(VariableResolverService)
    protected readonly varResolver: VariableResolverService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    /**
     * Open the given task's preview URL.
     * @param task a Che task to open its preview URL
     * @param externally if `true` a URL will opened in a separate browser's tab. Otherwise - into an embedded mini-browsers.
     */
    async preview(task: CheTaskConfiguration, externally?: boolean): Promise<void> {
        const previewURL = task.previewUrl;
        if (!previewURL) {
            return;
        }
        if (externally) {
            this.previewExternally(previewURL);
        } else {
            this.previewInternally(previewURL, task.label);
        }
    }

    /**
     * Open the given URL to preview it in the embedded mini-browser.
     * Method also tries to resolve the variables in the given URL.
     * @param previewURL a URL to preview
     * @param label short description of the given URL. Usually, the related task's label
     */
    protected async previewInternally(previewURL: string, label: string): Promise<void> {
        const url = await this.varResolver.resolve(previewURL);
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

    /**
     * Open the given URL to preview it in a separate browser's tab.
     * Method also tries to resolve the variables in the given URL.
     * @param previewURL a URL to go to
     */
    protected async previewExternally(previewURL: string): Promise<void> {
        const url = await this.varResolver.resolve(previewURL);
        this.windowService.openNewWindow(url);
    }
}
