/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { MessageConnection, Logger } from 'vscode-jsonrpc';
import { createWebSocketConnection, IWebSocket } from 'vscode-ws-jsonrpc';
import { ConsoleLogger } from 'vscode-ws-jsonrpc';
import * as ReconnectingWebSocket from 'reconnecting-websocket';

// copied from the https://github.com/TypeFox/vscode-ws-jsonrpc/blob/v0.0.2-2/src/connection.ts
// and slightly modified to use it in node runtime

export function listen(options: {
    webSocket: ReconnectingWebSocket;
    logger?: Logger;
    onConnection: (connection: MessageConnection) => void;
}) {
    const { webSocket, onConnection } = options;
    const logger = options.logger || new ConsoleLogger();
    webSocket.addEventListener('open', () => {
        const socket = toSocket(webSocket);
        const connection = createWebSocketConnection(socket, logger);
        onConnection(connection);
    });
}

export function toSocket(webSocket: ReconnectingWebSocket): IWebSocket {
    return {
        send: content => webSocket.send(content),
        onMessage: cb => {
            webSocket.addEventListener('message', event => cb(event.data));
        },
        onError: cb => webSocket.onerror = event => {
            if ('message' in event) {
                cb((event as any).message);
            }
        },
        onClose: cb => webSocket.onclose = event => cb(event.code, event.reason),
        dispose: () => webSocket.close()
    };
}
