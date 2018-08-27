/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable } from 'inversify';
import { ConsoleLogger, createWebSocketConnection, IWebSocket } from 'vscode-ws-jsonrpc';
import * as ws from 'ws';
const ReconnectingWebSocket = require('reconnecting-websocket');
import { JsonRpcProxy, JsonRpcProxyFactory, ConnectionHandler } from '@theia/core/lib/common/messaging';

@injectable()
export class JsonRpcProxyProvider {

    /** Create a proxy object to remote interface of T type over a web socket connection for the given path. */
    createProxy<T extends object>(path: string): JsonRpcProxy<T> {
        const factory = new JsonRpcProxyFactory<T>();
        this.listen({
            path,
            onConnection: connection => factory.listen(connection)
        });
        return factory.createProxy();
    }

    protected listen(handler: ConnectionHandler): void {
        const webSocket = new ReconnectingWebSocket(handler.path, undefined, {
            constructor: ws,
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            connectionTimeout: 10000,
            maxRetries: Infinity,
            debug: false
        });
        const logger = new ConsoleLogger();
        webSocket.addEventListener('open', () => {
            const vsCodeWebSocket = this.createVsCodeWebSocket(webSocket);
            const messageConnection = createWebSocketConnection(vsCodeWebSocket, logger);
            handler.onConnection(messageConnection);
        });
        webSocket.onerror = function (error: Event) {
            logger.error('' + error);
            return;
        };
    }

    protected createVsCodeWebSocket(webSocket: WebSocket): IWebSocket {
        return {
            send: msg => webSocket.send(msg),
            onMessage: cb => webSocket.addEventListener('message', event => cb(event.data)),
            onError: cb => webSocket.onerror = event => {
                if ('message' in event) {
                    cb((event as any).message);
                }
            },
            onClose: cb => webSocket.onclose = event => cb(event.code, event.reason),
            dispose: () => webSocket.close()
        };
    }
}
