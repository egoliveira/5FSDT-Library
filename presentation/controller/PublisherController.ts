import {AbstractController} from "../../presentation/controller/AbstractController";
import {inject, injectable} from "tsyringe";
import {
    CreatePublisherUseCase,
    CreatePublisherUseCaseParams
} from "../../domain/usecase/publisher/CreatePublisherUseCase";
import {IncomingMessage, ServerResponse} from "http";
import {Log} from "../../util/Log";
import {ValidatePublisherNameUseCase} from "../../domain/usecase/publisher/ValidatePublisherNameUseCase";
import {RetrieveAllPublishersUseCase} from "../../domain/usecase/publisher/RetrieveAllPublishersUseCase";
import {RetrievePublisherByIdUseCase} from "../../domain/usecase/publisher/RetrievePublisherByIdUseCase";
import {DeletePublisherByIdUseCase} from "../../domain/usecase/publisher/DeletePublisherByIdUseCase";
import {
    UpdatePublisherUseCase,
    UpdatePublisherUseCaseParams
} from "../../domain/usecase/publisher/UpdatePublisherUseCase";

@injectable()
export class PublisherController extends AbstractController {
    private static readonly LOG_TAG = "PublisherController";

    private static readonly NAME_REQUEST_FIELD = "name"

    private readonly retrieveAllPublishersUseCase: RetrieveAllPublishersUseCase;

    private readonly retrievePublisherByIdUseCase: RetrievePublisherByIdUseCase;

    private readonly createPublisherUseCase: CreatePublisherUseCase;

    private readonly deletePublisherByIdUseCase: DeletePublisherByIdUseCase;

    private readonly updatePublisherUseCase: UpdatePublisherUseCase;

    private readonly validatePublisherNameUseCase: ValidatePublisherNameUseCase;

    constructor(
        @inject(RetrieveAllPublishersUseCase) retrieveAllPublishersUseCase: RetrieveAllPublishersUseCase,
        @inject(RetrievePublisherByIdUseCase) retrievePublisherByIdUseCase: RetrievePublisherByIdUseCase,
        @inject(CreatePublisherUseCase) createPublisherUseCase: CreatePublisherUseCase,
        @inject(DeletePublisherByIdUseCase) deletePublisherByIdUseCase: DeletePublisherByIdUseCase,
        @inject(UpdatePublisherUseCase) updatePublisherUseCase: UpdatePublisherUseCase,
        @inject(ValidatePublisherNameUseCase) validatePublisherNameUseCase: ValidatePublisherNameUseCase) {
        super("publisher");

        this.retrieveAllPublishersUseCase = retrieveAllPublishersUseCase;
        this.retrievePublisherByIdUseCase = retrievePublisherByIdUseCase;
        this.createPublisherUseCase = createPublisherUseCase;
        this.deletePublisherByIdUseCase = deletePublisherByIdUseCase;
        this.updatePublisherUseCase = updatePublisherUseCase;
        this.validatePublisherNameUseCase = validatePublisherNameUseCase;
    }

    async handleGet(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(PublisherController.LOG_TAG, "Handling GET request...");

        let handled = false;

        if (pathParts.length == 0) {
            try {
                const publishers = await this.retrieveAllPublishersUseCase.execute();

                if (publishers.length > 0) {
                    this.writeSuccess(publishers, res);
                } else {
                    this.writeNotFound(res);
                }
            } catch (error) {
                if (error instanceof Error) {
                    this.writeRequestError(res, error.message);
                } else {
                    this.writeRequestError(res, "Can't retrieve publishers.")
                }
            }

            handled = true;
        } else {
            const publisherId = Number(pathParts[0]);

            if (!isNaN(publisherId)) {
                try {
                    const publisher = await this.retrievePublisherByIdUseCase.execute(publisherId);

                    if (publisher != null) {
                        this.writeSuccess(publisher, res);
                    } else {
                        this.writeNotFound(res);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, `Can't retrieve publisher by id ${publisherId}.`)
                    }
                }

                handled = true;
            }
        }

        return handled;
    }

    async handlePost(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(PublisherController.LOG_TAG, "Handling POST request...");

        let rawPostContent = '';

        req.on('data', (chunk) => {
            rawPostContent += chunk;
        });

        req.on('end', async () => {
            let content = this.parseJSONRequest(rawPostContent);

            if (content != null) {
                try {
                    const params = new CreatePublisherUseCaseParams(
                        await this.validatePublisherNameUseCase.execute(content[PublisherController.NAME_REQUEST_FIELD])
                    );

                    await this.createPublisherUseCase.execute(params);

                    this.writeSuccess("Publisher created.", res);
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, "Can't create publisher.")
                    }
                }
            } else {
                this.writeRequestError(res, "Can't parse create publisher request content.")
            }
        });

        return true;
    }

    async handleDelete(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(PublisherController.LOG_TAG, "Handling DELETE request...");

        let handled = false;

        if (pathParts.length > 0) {
            const publisherId = Number(pathParts[0]);

            if (!isNaN(publisherId)) {
                try {
                    const deleted = await this.deletePublisherByIdUseCase.execute(publisherId);

                    if (deleted) {
                        this.writeSuccess("", res);
                    } else {
                        this.writeNotFound(res);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, "Can't delete publisher.")
                    }
                }

                handled = true;
            }
        }

        return handled;
    }

    async handlePut(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(PublisherController.LOG_TAG, "Handling PUT request...");

        let handled = false;

        if (pathParts.length > 0) {
            const publisherId = Number(pathParts[0]);

            if (!isNaN(publisherId)) {
                handled = true;

                let rawPutContent = '';

                req.on('data', (chunk) => {
                    rawPutContent += chunk;
                });

                req.on('end', async () => {
                    let content = this.parseJSONRequest(rawPutContent);

                    if (content != null) {
                        try {
                            const params = new UpdatePublisherUseCaseParams(
                                publisherId,
                                await this.validatePublisherNameUseCase.execute(content[PublisherController.NAME_REQUEST_FIELD])
                            );

                            await this.updatePublisherUseCase.execute(params);

                            this.writeSuccess("Publisher updated.", res);
                        } catch (error) {
                            if (error instanceof Error) {
                                this.writeRequestError(res, error.message);
                            } else {
                                this.writeRequestError(res, "Can't update publisher.")
                            }
                        }
                    } else {
                        this.writeRequestError(res, "Can't parse update publisher request content.")
                    }
                });
            }
        }

        return handled;
    }
}