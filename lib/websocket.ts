import * as logger from './logger';
const WebSocket = require('ws');

let wss: any;

export function init(): void {
    wss = new WebSocket.Server({
        port: 4623
    });
    logger.info('Started websocket with ' + wss.address().family + ' on port' + wss.address().port);

    wss.on('connection', (ws, req) => {
        logger.info('Client connected: ' + req.connection.remoteAddress);

        ws.on('message', data => {
            logger.info('client message received: ' + data);
            ws.send(data);
        });
    });
}

export function send(message: any): void {
    const json = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}

export class MatchUpdate {
    constructor(public updateType: UpdateType, public data: any) {}
}

export enum UpdateType {
    USER_SLOTTED,
    USER_UNSLOTTED,
    MATCH_CHANGED
}