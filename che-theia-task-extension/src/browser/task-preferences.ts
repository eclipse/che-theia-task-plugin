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
        'che.task.preview.notifications': {
            'type': 'string',
            'enum': [
                'on',
                'alwaysPreview',
                'alwaysGoTo',
                'off'
            ],
            'default': 'on',
            'description': "Enable/disable the notifications with a proposal to open a Che task's preview URL. Can be: 'on', 'alwaysPreview', 'alwaysGoTo' or 'off'."
        }
    }
};

export interface CheTaskConfiguration {
    'che.task.preview.notifications': 'on' | 'alwaysPreview' | 'alwaysGoTo' | 'off'
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
