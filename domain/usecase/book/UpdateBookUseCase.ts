import {UseCase} from "../../../domain/usecase/UseCase";
import {inject, injectable} from "tsyringe";
import {Log} from "../../../util/Log";
import {BookRepository} from "../../../domain/repository/BookRepository";
import {Book} from "../../../domain/vo/Book";
import {AuthorRepository} from "../../../domain/repository/AuthorRepository";
import {PublisherRepository} from "../../../domain/repository/PublisherRepository";
import {Author} from "../../../domain/vo/Author";
import {Publisher} from "../../../domain/vo/Publisher";

@injectable()
export class UpdateBookUseCase implements UseCase<UpdateBookUseCaseParams, boolean> {
    private static readonly LOG_TAG = "UpdateBookUseCase";

    private readonly bookRepository: BookRepository;

    private readonly authorRepository: AuthorRepository;

    private readonly publisherRepository: PublisherRepository;

    constructor(@inject("BookRepository") bookRepository: BookRepository,
                @inject("AuthorRepository") authorRepository: AuthorRepository,
                @inject("PublisherRepository") publisherRepository: PublisherRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.publisherRepository = publisherRepository;
    }

    async execute(params: UpdateBookUseCaseParams): Promise<boolean> {
        Log.d(UpdateBookUseCase.LOG_TAG, `Updating book with parameters ${JSON.stringify(params)}...`);

        const existingBook = await this.bookRepository.getBookById(params.id);

        if (existingBook != null) {
            const duplicateBookByTitle = await this.bookRepository.getBookByTitle(params.bookTitle);

            if ((duplicateBookByTitle != null) && (duplicateBookByTitle.id != existingBook.id)) {
                Log.e(UpdateBookUseCase.LOG_TAG, `Can't update a book with parameters ${JSON.stringify(params)}. The given book title is already in use.`);

                throw Error(`Can't update a book with parameters ${JSON.stringify(params)}. The given book title is already in use.`);
            } else {
                const duplicateBookByISNB = await this.bookRepository.getBookByISBN(params.isbn);

                if ((duplicateBookByISNB != null) && (duplicateBookByISNB.id != existingBook.id)) {
                    Log.e(UpdateBookUseCase.LOG_TAG, `Can't update a book with parameters ${JSON.stringify(params)}. The given book ISBN is already in use.`);

                    throw Error(`Can't update a book with parameters ${JSON.stringify(params)}. The given book ISBN is already in use.`);
                } else {
                    const book = new Book(
                        existingBook.id,
                        params.bookTitle,
                        params.isbn,
                        params.year,
                        await this.getAuthors(params.authors),
                        await this.getPublisher(params.publisher)
                    )

                    const updated = await this.bookRepository.updateBook(book);

                    if (updated) {
                        Log.d(UpdateBookUseCase.LOG_TAG, `Book with parameters ${JSON.stringify(params)} updated successfully.`);
                    } else {
                        Log.d(UpdateBookUseCase.LOG_TAG, `Book with parameters ${JSON.stringify(params)} didn't updated.`);
                    }

                    return updated;
                }
            }
        } else {
            Log.e(UpdateBookUseCase.LOG_TAG, `Can't update a book with parameters ${JSON.stringify(params)}. There isn't a book with the given book id.`);

            throw Error(`Can't update a book with parameters ${JSON.stringify(params)}. There isn't a book with the given book id.`);
        }
    }

    private async getAuthors(authorNames: Array<string>): Promise<Array<Author>> {
        let authors = new Array<Author>();

        for (const authorName of authorNames) {
            const author = await this.authorRepository.getAuthorByName(authorName);

            if (author != null) {
                authors.push(author);
            } else {
                Log.e(UpdateBookUseCase.LOG_TAG, `Can't update the given book. There isn't an author with name ${authorName}.`);

                throw Error(`Can't update the given book. There isn't an author with name ${authorName}.`);
            }
        }

        return authors;
    }

    private async getPublisher(publisherName: string): Promise<Publisher> {
        const publisher = await this.publisherRepository.getPublisherByName(publisherName);

        if (publisher == null) {
            Log.e(UpdateBookUseCase.LOG_TAG, `Can't update the given book. There isn't a publisher with name ${publisherName}.`);

            throw Error(`Can't update the given book. There isn't a publisher with name ${publisherName}.`);
        }

        return publisher;
    }
}

export class UpdateBookUseCaseParams {
    private readonly _id: number;

    private readonly _bookTitle: string;

    private readonly _isbn: string;

    private readonly _year: number;

    private readonly _publisher: string;

    private readonly _authors: Array<string>;

    constructor(id: number, bookTitle: string, isbn: string, year: number, publisher: string, authors: Array<string>) {
        this._id = id;
        this._bookTitle = bookTitle;
        this._isbn = isbn;
        this._year = year;
        this._publisher = publisher;
        this._authors = authors;
    }

    get id(): number {
        return this._id;
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