"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPWSServer = exports.pwsServer = exports.PWSServer = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const defer_1 = require("./defer");
const Constants_1 = require("./struct/Constants");
class PWSServer {
    constructor(server) {
        this.ioServer = new socket_io_1.default.Server().listen(server);
        this.incRequestId = 0;
        this.incRequests = new Map();
        this.incQueue = [];
        this.clients = 0;
        this.ioServer.on('connection', this.onClientConnection.bind(this));
    }
    async emit(channelName, payload) {
        this.incRequestId++;
        const deferred = (0, defer_1.defer)();
        const message = {
            requestId: this.incRequestId,
            requestName: channelName,
            payload
        };
        if (this.clients == 0) {
            this.incRequests.set(this.incRequestId, deferred);
            this.incQueue.push(message);
            return deferred.promise;
        }
        this.incRequests.set(this.incRequestId, deferred);
        this.ioServer.emit(Constants_1.SERVER_EVENT_NAME, message);
        return deferred.promise;
    }
    onClientConnection(socket) {
        if (this.clients == 0) {
            this.incQueue.forEach(message => {
                this.ioServer.emit(Constants_1.SERVER_EVENT_NAME, message);
            });
            this.incQueue = [];
        }
        socket.on(Constants_1.CLIENT_EVENT_NAME, this.onClientMessage.bind(this));
        this.clients++;
    }
    onClientMessage(message) {
        this.incRequests.get(message.requestId)?.resolve(message.payload);
        this.incRequests.delete(message.requestId);
    }
}
exports.PWSServer = PWSServer;
exports.pwsServer = null;
const createPWSServer = (server) => {
    exports.pwsServer = new PWSServer(server);
    return exports.pwsServer;
};
exports.createPWSServer = createPWSServer;
