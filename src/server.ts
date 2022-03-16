import SocketIO, { Socket } from 'socket.io'
import http from 'http'
import { defer, Deferred } from './defer';
import { CLIENT_EVENT_NAME, SERVER_EVENT_NAME } from './struct/Constants';
import { ServerMessage } from './struct/ServerMessage';
import { ClientMessage } from './struct/ClientMessage';

export class PWSServer {

    /**
     * Socket IO server
     */
    private _io: SocketIO.Server;

    /**
     * Used in identifying message responses and resolving the right promise
     */
    private _requestIncrement: number = 0;

    /**
     * Messages that were queued while no clients were connected, automatically sends them when a client connects
     */
    private _requestQueue: ServerMessage[] = [];

    /**
     * Map of request increments and deferred promises representing the response to a PWS message 
     */

    private _respondableRequests: Map<number, Deferred<any>> = new Map();

    /**
     * The total number of clients connected
     */
    private _connectedClients: number = 0;

    public constructor(server: http.Server) {
        this._io = new SocketIO.Server().listen(server);
        this._io.on('connection', this.onClientConnection.bind(this))
    }

    /**
     * Sends a repliable message to all connected PWS clients. Only accepts the first response so this should
     * only be used in an environment where only one client is able to respond. (I.e message is related to a user,
     * user only has one client connected) 
     */
    public async sendMessage<T = any>(channelName: string, payload?: any): Promise<T> {
        const deferred = defer<T>();

        const message = <ServerMessage>{
            requestId: this._requestIncrement,
            requestName: channelName,
            payload
        }

        if (this._connectedClients == 0) {
            this._respondableRequests.set(this._requestIncrement, deferred)
            this._requestQueue.push(message);
            return deferred.promise!;
        }

        this._respondableRequests.set(this._requestIncrement, deferred)
        this._io.emit(SERVER_EVENT_NAME, message);

        this._requestIncrement++;
        return deferred.promise!;
    }

    /**
     * Called when a new client connects. If they are the first client to connect the message queue is emited
     */
    public onClientConnection(socket: Socket) {
        if (this._connectedClients == 0) {
            this._requestQueue.forEach(message => {
                this._io.emit(SERVER_EVENT_NAME, message)
            })

            this._requestQueue = [];
        }

        socket.on(CLIENT_EVENT_NAME, this.onClientMessage.bind(this))
        this._connectedClients++
    }

    /**
     * Called when a client sends or responds to a message
     */
    public onClientMessage(message: ClientMessage) {
        this._respondableRequests.get(message.requestId)?.resolve!(message.payload);
        this._respondableRequests.delete(message.requestId);
    }

    public get io(): SocketIO.Server {
        return this._io;
    }

    public get connectedClients(): number {
        return this._connectedClients;
    }

}

export let pwsServer: PWSServer | null = null;

export const createPWSServer = (server: http.Server): PWSServer => {
    pwsServer = new PWSServer(server);
    return pwsServer;
}