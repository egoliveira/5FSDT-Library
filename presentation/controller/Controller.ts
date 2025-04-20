import { IncomingMessage, ServerResponse } from "http";

export interface Controller {
    handle(url: URL, method: string, req: IncomingMessage, res: ServerResponse): Promise<boolean>;
}