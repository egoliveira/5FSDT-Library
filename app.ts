import {createServer} from "http";

import 'module-alias/register';
import "reflect-metadata";
import './di/di';
import {container} from "./di/di";

import {Router} from "./presentation/router/Router";

const router = container.resolve(Router);
const server = createServer(router.handleRequest);

const port = 3000;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});