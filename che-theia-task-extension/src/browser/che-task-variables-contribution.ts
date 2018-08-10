/*
 * Copyright (c) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import {inject, injectable} from 'inversify';
import {VariableContribution, VariableRegistry} from '@theia/variable-resolver/lib/browser';
import {CheWorkspaceClient} from '../common/che-workspace-client';
import {WorkspaceService} from '@theia/workspace/lib/browser/workspace-service';
import {SelectionService} from '@theia/core/lib/common';
import URI from '@theia/core/lib/common/uri';

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

    async registerVariables(variables: VariableRegistry): Promise<void> {

        variables.registerVariable({
            name: 'current.project.path',
            description: 'The path of the project root folder',
            resolve: async () => {
                const wsRoot = await this.workspaceService.root;
                if (!wsRoot || !wsRoot.uri) {
                    return undefined;
                }
                const rootWorkspaceUri = new URI(wsRoot.uri);

                const selection = this.selectionService.selection;
                if (!Array.isArray(selection) || !selection[0] || !selection[0].fileStat) {
                    return undefined;
                }
                const selectionUri = new URI(selection[0]!.fileStat!.uri);

                const rootWorkspacePath = rootWorkspaceUri.path.toString();
                const selectionPath = selectionUri.path.toString();
                if (!selectionPath.startsWith(rootWorkspacePath)) {
                    return undefined;
                }

                const relativeSelectionPath = selectionPath.substr(rootWorkspacePath.length);
                if (!relativeSelectionPath.length) {
                    return undefined;
                }
                const splitter = '/';
                const dirIndex = relativeSelectionPath[0] === splitter ? 1 : 0;

                return relativeSelectionPath.split(splitter)[dirIndex];
            }
        });
    }
}
