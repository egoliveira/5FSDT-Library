import {AbstractController} from "../../presentation/controller/AbstractController";
import {inject, injectable} from "tsyringe";
import {IncomingMessage, ServerResponse} from "http";
import {Log} from "../../util/Log";
import {CreateAuthorUseCase, CreateAuthorUseCaseParams} from "../../domain/usecase/author/CreateAuthorUseCase";
import {ValidateAuthorNameUseCase} from "../../domain/usecase/author/ValidateAuthorNameUseCase";
import {RetrieveAllAuthorsUseCase} from "../../domain/usecase/author/RetrieveAllAuthorsUseCase";
import {RetrieveAuthorByIdUseCase} from "../../domain/usecase/author/RetrieveAuthorByIdUseCase";
import {DeleteAuthorByIdUseCase} from "../../domain/usecase/author/DeleteAuthorByIdUseCase";
import {UpdateAuthorUseCase, UpdateAuthorUseCaseParams} from "../../domain/usecase/author/UpdateAuthorUseCase";

@injectable()
export class AuthorController extends AbstractController {
    private static readonly LOG_TAG = "AuthorController";

    private static readonly NAME_REQUEST_FIELD = "name"

    private readonly retrieveAllAuthorsUseCase: RetrieveAllAuthorsUseCase;

    private readonly retrieveAuthorByIdUseCase: RetrieveAuthorByIdUseCase;

    private readonly createAuthorUseCase: CreateAuthorUseCase;

    private readonly deleteAuthorByIdUseCase: DeleteAuthorByIdUseCase;

    private readonly updateAuthorUseCase: UpdateAuthorUseCase;

    private readonly validateAuthorNameUseCase: ValidateAuthorNameUseCase;

    constructor(
        @inject(RetrieveAllAuthorsUseCase) retrieveAllAuthorsUseCase: RetrieveAllAuthorsUseCase,
        @inject(RetrieveAuthorByIdUseCase) retrieveAuthorByIdUseCase: RetrieveAuthorByIdUseCase,
        @inject(CreateAuthorUseCase) createAuthorUceCase: CreateAuthorUseCase,
        @inject(DeleteAuthorByIdUseCase) deleteAuthorByIdUseCase: DeleteAuthorByIdUseCase,
        @inject(UpdateAuthorUseCase) updateAuthorUseCase: UpdateAuthorUseCase,
        @inject(ValidateAuthorNameUseCase) validateAuthorNameUseCase: ValidateAuthorNameUseCase) {
        super("author");

        this.retrieveAllAuthorsUseCase = retrieveAllAuthorsUseCase;
        this.retrieveAuthorByIdUseCase = retrieveAuthorByIdUseCase;
        this.createAuthorUseCase = createAuthorUceCase;
        this.deleteAuthorByIdUseCase = deleteAuthorByIdUseCase;
        this.updateAuthorUseCase = updateAuthorUseCase;
        this.validateAuthorNameUseCase = validateAuthorNameUseCase;
    }

    async handleGet(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(AuthorController.LOG_TAG, "Handling GET request...");

        let handled = false;

        if (pathParts.length == 0) {
            try {
                const authors = await this.retrieveAllAuthorsUseCase.execute();

                if (authors.length > 0) {
                    this.writeSuccess(authors, res);
                } else {
                    this.writeNotFound(res);
                }
            } catch (error) {
                if (error instanceof Error) {
                    this.writeRequestError(res, error.message);
                } else {
                    this.writeRequestError(res, "Can't retrieve authors.")
                }
            }

            handled = true;
        } else {
            const authorId = Number(pathParts[0]);

            if (!isNaN(authorId)) {
                try {
                    const author = await this.retrieveAuthorByIdUseCase.execute(authorId);

                    if (author != null) {
                        this.writeSuccess(author, res);
                    } else {
                        this.writeNotFound(res);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, `Can't retrieve author by id ${authorId}.`)
                    }
                }

                handled = true;
            }
        }

        return handled;
    }

    async handlePost(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(AuthorController.LOG_TAG, "Handling POST request...");

        let rawPostContent = '';

        req.on('data', (chunk) => {
            rawPostContent += chunk;
        });

        req.on('end', async () => {
            let content = this.parseJSONRequest(rawPostContent);

            if (content != null) {
                try {
                    const params = new CreateAuthorUseCaseParams(
                        await this.validateAuthorNameUseCase.execute(content[AuthorController.NAME_REQUEST_FIELD])
                    );

                    await this.createAuthorUseCase.execute(params);

                    this.writeSuccess("Author created.", res);
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, "Can't create author.")
                    }
                }
            } else {
                this.writeRequestError(res, "Can't parse create author request content.")
            }
        });

        return true;
    }

    async handleDelete(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(AuthorController.LOG_TAG, "Handling DELETE request...");

        let handled = false;

        if (pathParts.length > 0) {
            const authorId = Number(pathParts[0]);

            if (!isNaN(authorId)) {
                try {
                    const deleted = await this.deleteAuthorByIdUseCase.execute(authorId);

                    if (deleted) {
                        this.writeSuccess("", res);
                    } else {
                        this.writeNotFound(res);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, "Can't delete author.")
                    }
                }

                handled = true;
            }
        }

        return handled;
    }

    async handlePut(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(AuthorController.LOG_TAG, "Handling PUT request...");

        let handled = false;

        if (pathParts.length > 0) {
            const authorId = Number(pathParts[0]);

            if (!isNaN(authorId)) {
                handled = true;

                let rawPutContent = '';

                req.on('data', (chunk) => {
                    rawPutContent += chunk;
                });

                req.on('end', async () => {
                    let content = this.parseJSONRequest(rawPutContent);

                    if (content != null) {
                        try {
                            const params = new UpdateAuthorUseCaseParams(
                                authorId,
                                await this.validateAuthorNameUseCase.execute(content[AuthorController.NAME_REQUEST_FIELD])
                            );

                            await this.updateAuthorUseCase.execute(params);

                            this.writeSuccess("Author updated.", res);
                        } catch (error) {
                            if (error instanceof Error) {
                                this.writeRequestError(res, error.message);
                            } else {
                                this.writeRequestError(res, "Can't update author.")
                            }
                        }
                    } else {
                        this.writeRequestError(res, "Can't parse update author request content.")
                    }
                });
            }
        }

        return handled;
    }
}