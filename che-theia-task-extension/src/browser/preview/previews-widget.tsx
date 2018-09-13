/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject, postConstruct } from 'inversify';
import { Message } from '@phosphor/messaging';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { PreviewsWidgetModel } from './previews-widget-model';
import { CheTaskConfiguration } from '../../common/task-protocol';
import * as React from 'react';

export const PREVIEWS_WIDGET_FACTORY_ID = 'previewUrlsView';

/** Displays the preview URLs of all running Che tasks. */
@injectable()
export class PreviewsWidget extends ReactWidget {

    @inject(PreviewsWidgetModel)
    protected readonly model: PreviewsWidgetModel;

    constructor() {
        super();
        this.id = 'previewUrls';
        this.addClass('preview-urls');
        this.title.label = 'Preview URLs';
        this.title.caption = 'Shows the URLs of the services launched by the tasks';
        this.title.iconClass = 'fa fa-link';
        this.title.closable = true;
        this.node.tabIndex = 0;
    }

    @postConstruct()
    protected init(): void {
        this.update();
        this.model.onChanged(() => this.update());
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    protected render(): React.ReactNode {
        const tasks = this.model.getTasks();
        if (tasks.length === 0) {
            return <React.Fragment>{this.renderPlaceholder()}</React.Fragment>;
        }
        return <React.Fragment>{this.renderPreviewsContents()}</React.Fragment>;
    }

    protected renderPlaceholder(): React.ReactNode {
        return <div className='container placeholder'>No Che tasks with a preview URL are running</div>;
    }

    protected renderPreviewsContents(): React.ReactNode {
        return <div className='container'>{this.renderURLs()}</div>;
    }

    protected renderURLs(): React.ReactNode[] {
        return this.model.getTasks().map((task, idx) =>
            <div key={task.label + idx} className='url-container'>
                <span key='link' className='link'>{task.previewUrl!}</span>
                <span key='label' className='label'>{task.label}</span>
                <div key='actions' className='actions-container'>
                    {this.renderActions(task)}
                </div>
            </div>);
    }

    protected renderActions(task: CheTaskConfiguration): React.ReactNode[] {
        return [
            <button key='preview-url' className='theia-button' onClick={() => this.model.previewURL(task)}>Preview</button>,
            <button key='goto-url' className='theia-button' onClick={() => this.model.goToURL(task)}>Go To</button>
        ];
    }
}
