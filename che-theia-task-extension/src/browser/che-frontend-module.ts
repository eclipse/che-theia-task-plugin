/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { ContainerModule, Container } from 'inversify';
import { WidgetFactory, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { CommandContribution } from '@theia/core/lib/common/command';
import { TaskContribution } from '@theia/task/lib/browser';
import { TerminalWidgetOptions } from '@theia/terminal/lib/browser/base/terminal-widget';
import { VariableContribution } from '@theia/variable-resolver/lib/browser';
import { CheTaskContribution } from './che-task-contribution';
import { CheTaskProvider } from './che-task-provider';
import { CheTaskService } from './che-task-service';
import { CheTaskResolver } from './che-task-resolver';
import { CheTaskWatcher } from './che-task-watcher';
import { CHE_TERMINAL_WIDGET_FACTORY_ID, CheTerminalWidget, CheTerminalWidgetOptions } from './che-terminal-widget';
import { MachinePicker } from './machine-picker';
import { PreviewUrlIndicator } from './preview-url-indicator';
import { PreviewUrlQuickOpen } from './preview-url-quick-open';
import { ServerVariablesContribution } from './server-variables-contribution';
import { CheWorkspaceClient } from '../common/che-workspace-client';
import { ProjectPathVariableContribution } from './che-task-variables-contribution';
import { CheApiEndPointProvider } from '../common/che-api-endpoint-provider';
import { CheApiExternalEndPointProvider } from './che-api-external-endpoint-provider';

export default new ContainerModule(bind => {
    bind(CheWorkspaceClient).toSelf().inSingletonScope();

    bind(VariableContribution).to(ServerVariablesContribution).inSingletonScope();
    bind(VariableContribution).to(ProjectPathVariableContribution).inSingletonScope();

    bind(MachinePicker).toSelf().inSingletonScope();

    bind(CheApiEndPointProvider).to(CheApiExternalEndPointProvider).inSingletonScope();

    bind(CheTaskProvider).toSelf().inSingletonScope();
    bind(CheTaskResolver).toSelf().inSingletonScope();
    bind(CheTaskContribution).toSelf().inSingletonScope();
    bind(TaskContribution).toService(CheTaskContribution);

    bind(PreviewUrlQuickOpen).toSelf().inSingletonScope();
    bind(PreviewUrlIndicator).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(PreviewUrlIndicator);
    bind(CommandContribution).toService(PreviewUrlIndicator);

    bind(CheTaskWatcher).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(CheTaskWatcher);

    bind(CheTerminalWidget).toSelf().inTransientScope();
    let terminalNum = 0;
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: CHE_TERMINAL_WIDGET_FACTORY_ID,
        createWidget: (options: CheTerminalWidgetOptions) => {
            const child = new Container({ defaultScope: 'Singleton' });
            child.parent = ctx.container;
            const counter = terminalNum++;
            const domId = options.id || 'che-terminal-' + counter;
            const widgetOptions: CheTerminalWidgetOptions = {
                title: options.taskLabel,
                useServerTitle: true,
                destroyTermOnClose: true,
                ...options
            };
            child.bind(TerminalWidgetOptions).toConstantValue(widgetOptions);
            child.bind('terminal-dom-id').toConstantValue(domId);
            return child.get(CheTerminalWidget);
        }
    }));

    bind(CheTaskService).toSelf().inSingletonScope();
});
