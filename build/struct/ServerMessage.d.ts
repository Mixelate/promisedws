export interface ServerMessage<REQ = any, RES = any> {
    requestId: number;
    requestName: string;
    payload: REQ;
    reply?: (RES: any) => void;
}
