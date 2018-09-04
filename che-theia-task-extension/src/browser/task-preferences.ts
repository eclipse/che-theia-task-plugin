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
import {
    createPreferenceProxy,
    PreferenceProxy,
    PreferenceService,
    PreferenceContribution,
    PreferenceSchema
} from '@theia/core/lib/browser/preferences';

export const CheTaskConfigSchema: PreferenceSchema = {
    'type': 'object',
    'properties': {
        'che.task.previewurl.notifications.show': {
            'type': 'boolean',
            'description': 'Show the notifications suggest to open a task preview URL.',
            'default': true
        }
    }
};

export interface CheTaskConfiguration {
    'che.task.previewurl.notifications.show': boolean
}

export const CheTaskPreferences = Symbol('CheTaskPreferences');
export type CheTaskPreferences = PreferenceProxy<CheTaskConfiguration>;

export function createCheTaskPreferences(preferences: PreferenceService): CheTaskPreferences {
    return createPreferenceProxy(preferences, CheTaskConfigSchema);
}

export function bindCheTaskPreferences(bind: interfaces.Bind): void {
    bind(CheTaskPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get<PreferenceService>(PreferenceService);
        return createCheTaskPreferences(preferences);
    });

    bind(PreferenceContribution).toConstantValue({ schema: CheTaskConfigSchema });
}
