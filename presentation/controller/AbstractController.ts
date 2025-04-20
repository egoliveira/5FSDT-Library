import {HttpMethod} from "../vo/HttpMethod";
import {Controller} from "./Controller";
import {IncomingMessage, ServerResponse} from "http";
import {Log} from "../../util/Log";

export abstract class AbstractController implements Controller {
    private static readonly TAG = "AbstractController";

    private readonly pathPart: string;

    private static readonly BASE_API_PATH = "/api/v1";

    protected constructor(pathPart: string) {
        this.pathPart = pathPart;
    }

    handle(url: URL, method: string, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        let handled: Promise<boolean>;

        if (url.pathname.startsWith(`${AbstractController.BASE_API_PATH}/${this.pathPart}`)) {
            const pathParts = this.getPathParts(url);

            switch (method) {
                case HttpMethod.GET:
                    handled = this.handleGet(pathParts, req, res);
                    break;
                case HttpMethod.POST:
                    handled = this.handlePost(pathParts, req, res);
                    break;
                case HttpMethod.PUT:
                    handled = this.handlePut(pathParts, req, res);
                    break;
                case HttpMethod.DELETE:
                    handled = this.handleDelete(pathParts, req, res);
                    break;
                default:
                    handled = new Promise((resolve, _) => {
                            resolve(false)
                        }
                    );
                    break;
            }
        } else {
            handled = new Promise((resolve, _) => {
                    resolve(false)
                }
            );
        }

        return handled;
    }

    handleGet(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        return new Promise((resolve, _) => {
                resolve(false)
            }
        );
    }

    handlePost(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        return new Promise((resolve, _) => {
                resolve(false)
            }
        );
    }

    handlePut(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        return new Promise((resolve, _) => {
                resolve(false)
            }
        );
    }

    handleDelete(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        return new Promise((resolve, _) => {
                resolve(false)
            }
        );
    }

    writeSuccess(data: any, res: ServerResponse) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200, "OK");
        res.write(JSON.stringify(data));
        res.end()
    }

    writeNotFound(res: ServerResponse) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(404, "Not Found");
        res.end()
    }

    writeRequestError(res: ServerResponse, message: string | null) {
        res.writeHead(400, message ?? "Bad Request");
        res.end();
    }

    protected parseJSONRequest(content: string): any | null {
        Log.d(AbstractController.TAG, "Parsing request as JSON...");

        let obj: any | null = null;

        try {
            obj = JSON.parse(content);
        } catch (error) {
            Log.e(AbstractController.TAG, `Can't parse JSON content: ${error}`);
        }

        return obj;
    }

    private getPathParts(url: URL): Array<string> {
        const parts = url.pathname.split('/');
        const controllerPathPartIndex = parts.indexOf(this.pathPart);

        return parts.filter((_, index) => index > controllerPathPartIndex);
    }
}