import {IncomingMessage, ServerResponse} from "http";
import {AbstractController} from "./AbstractController";
import {inject, injectable} from "tsyringe";
import {Log} from "../../util/Log";
import {RetrieveAllBooksUseCase} from "../../domain/usecase/book/RetrieveAllBooksUseCase";
import {RetrieveBookByIdUseCase} from "../../domain/usecase/book/RetrieveBookByIdUseCase";
import {CreateBookUseCase, CreateBookUseCaseParams} from "../../domain/usecase/book/CreateBookUseCase";
import {ValidateBookTitleUseCase} from "../../domain/usecase/book/ValidateBookTitleUseCase";
import {ValidateAuthorsNamesUseCase} from "../../domain/usecase/author/ValidateAuthorsNamesUseCase";
import {ValidateBookISBNUseCase} from "../../domain/usecase/book/ValidateBookISBNUseCase";
import {ValidateBookYearUseCase} from "../../domain/usecase/book/ValidateBookYearUseCase";
import {ValidatePublisherNameUseCase} from "../../domain/usecase/publisher/ValidatePublisherNameUseCase";
import {DeleteBookByIdUseCase} from "../../domain/usecase/book/DeleteBookByIdUseCase";
import {UpdateBookUseCase, UpdateBookUseCaseParams} from "../../domain/usecase/book/UpdateBookUseCase";

@injectable()
export class BookController extends AbstractController {
    private static readonly LOG_TAG = "BookController";

    private static readonly BOOK_TITLE_REQUEST_FIELD = "bookTitle"

    private static readonly ISBN_REQUEST_FIELD = "isbn";

    private static readonly YEAR_REQUEST_FIELD = "year";

    private static readonly PUBLISHER_REQUEST_FIELD = "publisher"

    private static readonly AUTHORS_REQUEST_FIELD = "authors"

    private readonly retrieveAllBooksUseCase: RetrieveAllBooksUseCase;

    private readonly retrieveBookByIdUseCase: RetrieveBookByIdUseCase;

    private readonly validateBookTitleUseCase: ValidateBookTitleUseCase;

    private readonly validateBookISBNUseCase: ValidateBookISBNUseCase;

    private readonly validateBookYearUseCase: ValidateBookYearUseCase;

    private readonly validatePublisherNameUseCase: ValidatePublisherNameUseCase;

    private readonly validateAuthorsNamesUseCase: ValidateAuthorsNamesUseCase;

    private readonly createBookUseCase: CreateBookUseCase;

    private readonly updateBookUseCase: UpdateBookUseCase;

    private readonly deleteBookByIdUseCase: DeleteBookByIdUseCase;

    constructor(@inject(RetrieveAllBooksUseCase) retrieveAllBooksUseCase: RetrieveAllBooksUseCase,
                @inject(RetrieveBookByIdUseCase) retrieveBookByIdUseCase: RetrieveBookByIdUseCase,
                @inject(ValidateBookTitleUseCase) validateBookTitleUseCase: ValidateBookTitleUseCase,
                @inject(ValidateBookISBNUseCase) validateBookISBNUseCase: ValidateBookISBNUseCase,
                @inject(ValidateBookYearUseCase) validateBookYearUseCase: ValidateBookYearUseCase,
                @inject(ValidatePublisherNameUseCase) validatePublisherNameUseCase: ValidatePublisherNameUseCase,
                @inject(ValidateAuthorsNamesUseCase) validateAuthorsNamesUseCase: ValidateAuthorsNamesUseCase,
                @inject(CreateBookUseCase) createBookUseCase: CreateBookUseCase,
                @inject(DeleteBookByIdUseCase) deleteBookByIdUseCase: DeleteBookByIdUseCase,
                @inject(UpdateBookUseCase) updateBookUseCase: UpdateBookUseCase) {
        super("book");

        this.retrieveAllBooksUseCase = retrieveAllBooksUseCase;
        this.retrieveBookByIdUseCase = retrieveBookByIdUseCase;
        this.validateBookTitleUseCase = validateBookTitleUseCase;
        this.validateBookISBNUseCase = validateBookISBNUseCase;
        this.validateBookYearUseCase = validateBookYearUseCase;
        this.validatePublisherNameUseCase = validatePublisherNameUseCase;
        this.validateAuthorsNamesUseCase = validateAuthorsNamesUseCase;
        this.createBookUseCase = createBookUseCase;
        this.deleteBookByIdUseCase = deleteBookByIdUseCase;
        this.updateBookUseCase = updateBookUseCase;
    }

    async handleGet(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(BookController.LOG_TAG, "Handling GET request...");

        let handled = false;

        if (pathParts.length == 0) {
            handled = true;

            try {
                const books = await this.retrieveAllBooksUseCase.execute();

                if (books.length > 0) {
                    this.writeSuccess(books, res);
                } else {
                    this.writeNotFound(res);
                }
            } catch (error) {
                if (error instanceof Error) {
                    this.writeRequestError(res, error.message);
                } else {
                    this.writeRequestError(res, "Can't retrieve books.")
                }
            }
        } else {
            const bookId = Number(pathParts[0]);

            if (!isNaN(bookId)) {
                handled = true;

                try {
                    const book = await this.retrieveBookByIdUseCase.execute(bookId);

                    if (book != null) {
                        this.writeSuccess(book, res);
                    } else {
                        this.writeNotFound(res);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, `Can't retrieve book by id ${bookId}.`)
                    }
                }
            }
        }

        return handled;
    }

    async handlePost(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(BookController.LOG_TAG, "Handling POST request...");

        let rawPostContent = '';

        req.on('data', (chunk) => {
            rawPostContent += chunk;
        });

        req.on('end', async () => {
            let content = this.parseJSONRequest(rawPostContent);

            if (content != null) {
                try {
                    const params = new CreateBookUseCaseParams(
                        await this.validateBookTitleUseCase.execute(content[BookController.BOOK_TITLE_REQUEST_FIELD]),
                        await this.validateBookISBNUseCase.execute(content[BookController.ISBN_REQUEST_FIELD]),
                        await this.validateBookYearUseCase.execute(content[BookController.YEAR_REQUEST_FIELD]),
                        await this.validatePublisherNameUseCase.execute(content[BookController.PUBLISHER_REQUEST_FIELD]),
                        await this.validateAuthorsNamesUseCase.execute(content[BookController.AUTHORS_REQUEST_FIELD])
                    );

                    await this.createBookUseCase.execute(params);

                    this.writeSuccess("Book created.", res);
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, "Can't create book.")
                    }
                }
            } else {
                this.writeRequestError(res, "Can't parse create book request content.")
            }
        });

        return true;
    }

    async handleDelete(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(BookController.LOG_TAG, "Handling DELETE request...");

        let handled = false;

        if (pathParts.length > 0) {
            const bookId = Number(pathParts[0]);

            if (!isNaN(bookId)) {
                try {
                    const deleted = await this.deleteBookByIdUseCase.execute(bookId);

                    if (deleted) {
                        this.writeSuccess("", res);
                    } else {
                        this.writeNotFound(res);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.writeRequestError(res, error.message);
                    } else {
                        this.writeRequestError(res, "Can't delete book.")
                    }
                }

                handled = true;
            }
        }

        return handled;
    }

    async handlePut(pathParts: Array<string>, req: IncomingMessage, res: ServerResponse): Promise<boolean> {
        Log.d(BookController.LOG_TAG, "Handling PUT request...");

        let handled = false;

        if (pathParts.length > 0) {
            const bookId = Number(pathParts[0]);

            if (!isNaN(bookId)) {
                handled = true;

                let rawPutContent = '';

                req.on('data', (chunk) => {
                    rawPutContent += chunk;
                });

                req.on('end', async () => {
                    let content = this.parseJSONRequest(rawPutContent);

                    if (content != null) {
                        try {
                            const params = new UpdateBookUseCaseParams(
                                bookId,
                                await this.validateBookTitleUseCase.execute(content[BookController.BOOK_TITLE_REQUEST_FIELD]),
                                await this.validateBookISBNUseCase.execute(content[BookController.ISBN_REQUEST_FIELD]),
                                await this.validateBookYearUseCase.execute(content[BookController.YEAR_REQUEST_FIELD]),
                                await this.validatePublisherNameUseCase.execute(content[BookController.PUBLISHER_REQUEST_FIELD]),
                                await this.validateAuthorsNamesUseCase.execute(content[BookController.AUTHORS_REQUEST_FIELD])
                            );

                            await this.updateBookUseCase.execute(params);

                            this.writeSuccess("Book updated.", res);
                        } catch (error) {
                            if (error instanceof Error) {
                                this.writeRequestError(res, error.message);
                            } else {
                                this.writeRequestError(res, "Can't update book.")
                            }
                        }
                    } else {
                        this.writeRequestError(res, "Can't parse update book request content.")
                    }
                });
            }
        }

        return handled;
    }
}