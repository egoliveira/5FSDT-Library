import {inject, injectable} from "tsyringe";
import {UseCase} from "../UseCase";
import {BookRepository} from "../../../domain/repository/BookRepository";
import {Log} from "../../../util/Log";
import {PublisherRepository} from "../../../domain/repository/PublisherRepository";
import {Author} from "../../../domain/vo/Author";
import {AuthorRepository} from "../../../domain/repository/AuthorRepository";
import {Book} from "../../../domain/vo/Book";
import {Publisher} from "../../../domain/vo/Publisher";

@injectable()
export class CreateBookUseCase implements UseCase<CreateBookUseCaseParams, void> {
    private static readonly LOG_TAG = "CreateBookUseCase";

    private readonly bookRepository: BookRepository;

    private readonly publisherRepository: PublisherRepository;

    private readonly authorRepository: AuthorRepository;

    constructor(
        @inject("BookRepository") bookRepository: BookRepository,
        @inject("PublisherRepository") publisherRepository: PublisherRepository,
        @inject("AuthorRepository") authorRepository: AuthorRepository
    ) {
        this.bookRepository = bookRepository;
        this.publisherRepository = publisherRepository;
        this.authorRepository = authorRepository;
    }

    async execute(params: CreateBookUseCaseParams): Promise<void> {
        Log.d(CreateBookUseCase.LOG_TAG, `Creating book with parameters ${JSON.stringify(params)}...`);

        let book = await this.bookRepository.getBookByTitle(params.bookTitle);

        if (book == null) {
            let sameISBNBook = await this.bookRepository.getBookByISBN(params.isbn);

            if (sameISBNBook == null) {
                const book = new Book(
                    0,
                    params.bookTitle,
                    params.isbn,
                    params.year,
                    await this.getAuthors(params.authors),
                    await this.getPublisher(params.publisher)
                );

                await this.bookRepository.createBook(book);

                Log.d(CreateBookUseCase.LOG_TAG, `Book with parameters ${JSON.stringify(params)} created successfully.`);
            } else {
                Log.e(CreateBookUseCase.LOG_TAG, `Can't create a book with parameters ${JSON.stringify(params)}. The given ISBN is already in use by other book.`);

                throw Error(`Can't create a book with parameters ${JSON.stringify(params)}. The given ISBN is already in use by other book.`);
            }
        } else {
            Log.e(CreateBookUseCase.LOG_TAG, `Can't create a book with parameters ${JSON.stringify(params)}. There's a book with this title already.`);

            throw Error(`Can't create a book with parameters ${JSON.stringify(params)}. There's a book with this title already.`);
        }
    }

    private async getPublisher(publisherName: string): Promise<Publisher> {
        let publisher = await this.publisherRepository.getPublisherByName(publisherName);

        if (publisher == null) {
            Log.e(CreateBookUseCase.LOG_TAG, `Can't create book. Publisher ${publisherName} doesn't exist. Create it first.`);

            throw Error(`Can't create book. Publisher ${publisherName} doesn't exist. Create it first.`);
        }

        return publisher;
    }

    private async getAuthors(authorNames: Array<string>): Promise<Array<Author>> {
        let authors = new Array<Author>();

        for (let authorName of authorNames) {
            const author = await this.authorRepository.getAuthorByName(authorName);

            if (author != null) {
                authors.push(author);
            } else {
                Log.e(CreateBookUseCase.LOG_TAG, `Can't create book. Author ${authorName} doesn't exist. Create it first.`);

                throw Error(`Can't create book. Author ${authorName} doesn't exist. Create it first.`);
            }
        }

        return authors;
    }
}

export class CreateBookUseCaseParams {
    private readonly _bookTitle: string;

    private readonly _isbn: string;

    private readonly _year: number;

    private readonly _publisher: string;

    private readonly _authors: Array<string>;

    constructor(bookTitle: string, isbn: string, year: number, publisher: string, authors: Array<string>) {
        this._bookTitle = bookTitle;
        this._isbn = isbn;
        this._year = year;
        this._publisher = publisher;
        this._authors = authors;
    }

    get bookTitle(): string {
        return this._bookTitle;
    }

    get isbn(): string {
        return this._isbn;
    }

    get year(): number {
        return this._year;
    }

    get publisher(): string {
        return this._publisher;
    }

    get authors(): Array<string> {
        return this._authors;
    }
}