export interface ClientMessage<REQ = any, RES = any> {
    requestId: number;
    requestName: string;
    payload: REQ;
    reply?: (RES: any) => void;
}
