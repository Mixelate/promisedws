"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPWSClient = exports.pwsClient = exports.PWSClient = void 0;
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const Constants_1 = require("./struct/Constants");
class PWSClient {
    constructor(url) {
        this.ioClient = (0, socket_io_client_1.default)(url).connect();
        this.listeners = new Map();
        this.ioClient.on(Constants_1.SERVER_EVENT_NAME, this.onServerMessage.bind(this));
    }
    listen(name, callback) {
        this.listeners.set(name, [
            ...(this.listeners.get(name) || []),
            callback
        ]);
    }
    onServerMessage(message) {
        message.reply = ((payload) => {
            this.ioClient.emit(Constants_1.CLIENT_EVENT_NAME, {
                requestId: message.requestId,
                requestName: message.requestName,
                payload
            });
        }).bind(this);
        this.listeners.get(message.requestName)?.forEach(callback => {
            callback(message);
        });
    }
}
exports.PWSClient = PWSClient;
exports.pwsClient = null;
const createPWSClient = (url) => {
    exports.pwsClient = new PWSClient(url);
    return exports.pwsClient;
};
exports.createPWSClient = createPWSClient;
