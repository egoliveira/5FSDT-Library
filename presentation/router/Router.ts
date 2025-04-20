import {Log} from "../../util/Log";
import {IncomingMessage, ServerResponse} from "http";
import {inject, injectable} from "tsyringe";
import {BookController} from "../controller/BookController";
import {Controller} from "../controller/Controller";
import {PublisherController} from "../controller/PublisherController";
import {AuthorController} from "../controller/AuthorController";

@injectable()
export class Router {
    private static readonly LOG_TAG = "Router";

    // This is a workaround to access the controllers array. "this" isn't available in handleRequest method.
    private static CONTROLLERS: Controller[] = [];

    constructor(@inject(BookController) bookController: BookController,
                @inject(PublisherController) publisherController: PublisherController,
                @inject(AuthorController) authorController: AuthorController
    ) {
        Router.CONTROLLERS.push(bookController);
        Router.CONTROLLERS.push(publisherController);
        Router.CONTROLLERS.push(authorController);
    }

    async handleRequest(req: IncomingMessage, res: ServerResponse) {
        const parsedURL = new URL(req.url ?? "", `http://${req.headers.host}`);
        const method = req.method ?? "GET";

        Log.d(Router.LOG_TAG, `New request received. URL: ${parsedURL}, Method: ${method}`);

        let handled = false;

        for (let i = 0; (i < Router.CONTROLLERS.length) && (!handled); i++) {
            const controller = Router.CONTROLLERS[i];

            handled = await controller.handle(parsedURL, method, req, res);
        }

        if (!handled) {
            res.writeHead(404, "Not found");
            res.end()
        }
    }
}