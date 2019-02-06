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
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { CheTaskConfiguration } from '../../common/task-protocol';
import { MiniBrowserOpenHandler } from '@theia/mini-browser/lib/browser/mini-browser-open-handler';
import URI from '@theia/core/lib/common/uri';

@injectable()
export class PreviewUrlOpenService {

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(VariableResolverService)
    protected readonly varResolver: VariableResolverService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(MiniBrowserOpenHandler)
    protected readonly miniBrowserOpenHandler: MiniBrowserOpenHandler;

    /**
     * Open the given task's preview URL.
     * @param task a Che task to open its preview URL
     * @param externally if `true` a URL will opened in a separate browser's tab. Otherwise - into an embedded mini-browsers.
     */
    async preview(task: CheTaskConfiguration, externally?: boolean): Promise<void> {
        const previewURL = task.previewUrl;
        if (!previewURL || this.preview.length === 0) {
            return;
        }
        if (externally) {
            this.previewExternally(previewURL);
        } else {
            this.previewInternally(previewURL, task.label);
        }
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

    /**
     * Open the given URL to preview it in the embedded mini-browser.
     * Method also tries to resolve the variables in the given URL.
     * @param previewURL a URL to preview
     * @param label short description of the given URL. Usually, the related task's label
     */
    protected async previewInternally(previewURL: string, label: string): Promise<void> {
        const url = await this.varResolver.resolve(previewURL);
        await this.miniBrowserOpenHandler.open(new URI(url), {
            name: `Preview - ${label}`,
            widgetOptions: {
                area: 'right'
            }
        });
    }
}
