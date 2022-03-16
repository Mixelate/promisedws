/// <reference types="node" />
import SocketIO, { Socket } from 'socket.io';
import http from 'http';
import { ClientMessage } from './struct/ClientMessage';
export declare class PWSServer {
    ioServer: SocketIO.Server;
    private incRequestId;
    private incRequests;
    private incQueue;
    private clients;
    constructor(server: http.Server);
    emit(channelName: string, payload?: any): Promise<any>;
    onClientConnection(socket: Socket): void;
    onClientMessage(message: ClientMessage): void;
}
export declare let pwsServer: PWSServer | null;
export declare const createPWSServer: (server: http.Server) => PWSServer;
