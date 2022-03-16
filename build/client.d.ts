import { Socket } from 'socket.io-client';
import { ServerMessage } from './struct/ServerMessage';
export declare class PWSClient {
    ioClient: Socket;
    private listeners;
    constructor(url: `ws://${string}`);
    listen(name: string, callback: (ServerMessage: any) => any): void;
    onServerMessage(message: ServerMessage): void;
}
export declare let pwsClient: PWSClient | null;
export declare const createPWSClient: (url: `ws://${string}`) => PWSClient;
