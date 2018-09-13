/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import {inject, injectable} from 'inversify';
import {VariableContribution, VariableRegistry} from '@theia/variable-resolver/lib/browser';
import {CheWorkspaceClient} from '../../common/che-workspace-client';
import {WorkspaceService} from '@theia/workspace/lib/browser/workspace-service';
import {SelectionService} from '@theia/core/lib/common';
import {FileStat} from '@theia/filesystem/lib/common/filesystem';
import {MessageService} from '@theia/core/lib/common/message-service';

/**
 * Contributes the path for current project as a relative path to the first directory under the root workspace.
 */
@injectable()
export class ProjectPathVariableContribution implements VariableContribution {

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;
    @inject(CheWorkspaceClient)
    protected readonly cheWsClient: CheWorkspaceClient;
    @inject(SelectionService)
    protected readonly selectionService: SelectionService;
    @inject(MessageService)
    protected readonly messageService: MessageService;

    async registerVariables(variables: VariableRegistry): Promise<void> {

        variables.registerVariable({
            name: 'current.project.path',
            description: 'The path of the project root folder',
            resolve: async () => {
                let errorMessage = 'Can not resolve \'current.project.path\' variable. ';

                const selection = this.selectionService.selection;
                if (!Array.isArray(selection) || !selection[0] || !selection[0].fileStat || !selection[0].fileStat.uri) {
                    errorMessage += 'No item selected in the project explorer.';
                    await this.messageService.error(errorMessage);
                    return undefined;
                }
                const selectionUri = selection[0]!.fileStat!.uri;

                // WIP workspace folder is roots[0] https://github.com/theia-ide/theia/commit/80f402c621fe197130eae7abd22a0d89008b4ef1
                // Beware, workspace folder concept will diseappear in the next PR.
                const wsRoot = await this.workspaceService.roots;
                const currentRoot = wsRoot.find((root: FileStat) => {
                    // if multi-root
                    return selectionUri.startsWith(root.uri);
                });
                if (!currentRoot || !currentRoot.uri) {
                    errorMessage += 'Get current workspace root URI error.';
                    await this.messageService.error(errorMessage);
                    return undefined;
                }
                const rootWorkspaceUri = currentRoot.uri;

                if (!selectionUri.startsWith(rootWorkspaceUri)) {
                    errorMessage += 'The selection isn\'t under the current workspace root folder.';
                    await this.messageService.error(errorMessage);
                    return undefined;
                }

                const relativeSelectionPath = selectionUri.substr(rootWorkspaceUri.length);
                if (!relativeSelectionPath.length) {
                    errorMessage += 'Workspace root folder is selected and is not a project. Please select a project.';
                    await this.messageService.error(errorMessage);
                    return undefined;
                }
                const splitter = '/';
                const dirIndex = relativeSelectionPath[0] === splitter ? 1 : 0;

                return relativeSelectionPath.split(splitter)[dirIndex];
            }
        });
    }
}
