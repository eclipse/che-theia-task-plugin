
/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
import * as che from '@eclipse-che/plugin';
import "reflect-metadata";
import { CHE_TASK_TYPE } from './task-protocol';
import { CheTaskProvider } from './che-task-provider';
import { container } from './che-task-frontend-module';
import { CheTaskRunner } from './che-task-runner';
import { ServerVariableResolver } from './variable/server-variable-resolver';
import { ProjectPathVariableResolver } from './variable/project-path-variable-resolver';

export function start(context: theia.PluginContext) {
    const serverVariableResolver = container.get<ServerVariableResolver>(ServerVariableResolver);
    serverVariableResolver.registerVariables();

    const projectPathVariableResolver = container.get<ProjectPathVariableResolver>(ProjectPathVariableResolver);
    projectPathVariableResolver.registerVariables();

    const cheTaskProvider = container.get<CheTaskProvider>(CheTaskProvider);
    theia.tasks.registerTaskProvider(CHE_TASK_TYPE, cheTaskProvider);

    const cheTaskRunner = container.get<CheTaskRunner>(CheTaskRunner);
    che.task.registerTaskRunner(CHE_TASK_TYPE, cheTaskRunner);
}

export function stop() {

}
