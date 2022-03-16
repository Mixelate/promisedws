import SocketIO, { Socket } from 'socket.io-client'
import { ServerMessage } from './struct/ServerMessage';
import { CLIENT_EVENT_NAME, SERVER_EVENT_NAME } from './struct/Constants';
import { ClientMessage } from './struct/ClientMessage';

export class PWSClient {

    /**
     * SocketIO client
     */
    public ioClient: Socket

    /** 
     * Map of message callbacks
     */
    private listeners: Map<string, ((ServerMessage) => any)[]> = new Map();

    public constructor(url: `ws://${string}`) {
        this.ioClient = SocketIO(url).connect();
        this.ioClient.on(SERVER_EVENT_NAME, this.onServerMessage.bind(this))
    }

    /**
     * Registeres a new callback for a specific server message
     */
    public listen(name: string, callback: (ServerMessage) => any) {
        this.listeners.set(
            name,
            [
                ...(this.listeners.get(name) || []),
                callback
            ]
        )
    }

    /**
     * Called when the server emits a message
     */
    public onServerMessage(message: ServerMessage) {
        message.reply = ((payload: any) => {
            this.ioClient.emit(CLIENT_EVENT_NAME, <ClientMessage> {
                requestId: message.requestId,
                requestName: message.requestName,
                payload
            })
        }).bind(this)

        this.listeners.get(message.requestName)?.forEach(callback => {
            callback(message);
        })
    }

}

export let pwsClient: PWSClient | null = null;

export const createPWSClient = (url: `ws://${string}`): PWSClient => {
    pwsClient = new PWSClient(url);
    return pwsClient;
}