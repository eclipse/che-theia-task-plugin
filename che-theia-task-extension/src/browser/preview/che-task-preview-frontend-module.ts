/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { interfaces } from 'inversify';
import { WidgetFactory, FrontendApplicationContribution, bindViewContribution } from '@theia/core/lib/browser';
import { PreviewsContribution } from './previews-contribution';
import { PreviewUrlService } from './preview-url-service';
import { PreviewsWidget, PREVIEWS_WIDGET_FACTORY_ID } from './previews-widget';

import '../../../src/browser/preview/style/index.css';

export function bindPreviewModule(bind: interfaces.Bind) {

    bindViewContribution(bind, PreviewsContribution);
    bind(FrontendApplicationContribution).toService(PreviewsContribution);

    bind(PreviewsWidget).toSelf().inTransientScope();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: PREVIEWS_WIDGET_FACTORY_ID,
        createWidget: () => ctx.container.get(PreviewsWidget)
    }));

    bind(PreviewUrlService).toSelf().inSingletonScope();
}
