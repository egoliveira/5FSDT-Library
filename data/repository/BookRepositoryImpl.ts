import {Author} from "../../domain/vo/Author";
import {BookRepository} from "../../domain/repository/BookRepository";
import {Book} from "../../domain/vo/Book";
import {Database} from "../vo/database.types";
import {SupabaseClient} from '@supabase/supabase-js';
import {AuthorMapper} from "../mapper/AuthorMapper";
import {Log} from "../../util/Log";
import {DatabaseConstants} from "./DatabaseConstants";
import {BookMapper} from "../mapper/BookMapper";

export class BookRepositoryImpl implements BookRepository {
    private static readonly LOG_TAG = "BookRepositoryImpl";

    private readonly dbClient: SupabaseClient<Database>

    private readonly authorMapper: AuthorMapper;

    private readonly bookMapper: BookMapper;

    constructor(dbClient: SupabaseClient<Database>,
                authorMapper: AuthorMapper,
                bookMapper: BookMapper) {
        this.dbClient = dbClient
        this.authorMapper = authorMapper;
        this.bookMapper = bookMapper;
    }

    async getBooks(): Promise<Array<Book>> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Retrieving all books...`);

        const books = new Array<Book>();

        const {data: bookData, error: bookError} = await this.dbClient.from(DatabaseConstants.BookTable.TABLE_NAME)
            .select(`${DatabaseConstants.BookTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME}, ${DatabaseConstants.PublisherTable.TABLE_NAME}(${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME})`);

        if (bookData) {
            Log.d(BookRepositoryImpl.LOG_TAG, `Number of books found: ${bookData.length}.`);

            for (const bookInfo of bookData) {
                const bookId = bookInfo.id;
                const authors = await this.getBookAuthorsData(bookId);
                const book = this.bookMapper.fromDBBook(bookInfo, authors);

                if (book != null) {
                    books.push(book);
                }
            }
        } else {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not retrieve all books. Error: ${bookError.message}.`);
        }

        return books;
    }

    async getBookById(id: number): Promise<Book | null> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Retrieving book id ${id}...`);

        let book: Book | null = null;

        const {data: bookData, error: bookError} = await this.dbClient.from(DatabaseConstants.BookTable.TABLE_NAME)
            .select(`${DatabaseConstants.BookTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME}, ${DatabaseConstants.PublisherTable.TABLE_NAME}(${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME})`)
            .eq(DatabaseConstants.BookTable.Fields.ID_FIELD_NAME, id);

        if (bookData && (bookData.length == 1)) {
            Log.d(BookRepositoryImpl.LOG_TAG, `Book id ${id} found.`);

            const authors = await this.getBookAuthorsData(id);

            book = this.bookMapper.fromDBBook(bookData[0], authors);
        } else if (bookError) {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not retrieve book by id ${id}. Error: ${bookError.message}.`);

            throw Error(`Could not retrieve book by id ${id}. Error: ${bookError.message}.`);
        } else {
            Log.d(BookRepositoryImpl.LOG_TAG, `Book id ${id} not found.`)
        }

        return book;
    }

    async getBookByTitle(title: string): Promise<Book | null> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Retrieving book by title ${title}...`);

        let book: Book | null = null;

        const {data: bookData, error: bookError} = await this.dbClient.from(DatabaseConstants.BookTable.TABLE_NAME)
            .select(`${DatabaseConstants.BookTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME}, ${DatabaseConstants.PublisherTable.TABLE_NAME}(${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME})`)
            .ilike(DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME, `%${title}%`);

        if (bookData && (bookData.length > 0)) {
            for (let i = 0; (i < bookData.length) && (book == null); i++) {
                let bookTitle = bookData[i][DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME];

                if (title.toLowerCase() == bookTitle.toLowerCase()) {
                    const authors = await this.getBookAuthorsData(bookData[i][DatabaseConstants.BookTable.Fields.ID_FIELD_NAME]);

                    book = this.bookMapper.fromDBBook(bookData[0], authors);
                }
            }

            if (book != null) {
                Log.d(BookRepositoryImpl.LOG_TAG, `Book with title ${title} found.`);
            } else {
                Log.d(BookRepositoryImpl.LOG_TAG, `Book with title ${title} not found.`)
            }
        } else if (bookError) {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not retrieve book by title ${title}. Error: ${bookError}.`);

            throw Error(`Could not retrieve book by title ${title}. Error: ${bookError}.`);
        } else {
            Log.d(BookRepositoryImpl.LOG_TAG, `Book with title ${title} not found.`)
        }

        return book;
    }

    async getBookByISBN(isbn: string): Promise<Book | null> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Retrieving book by ISBN ${isbn}...`);

        let book: Book | null = null;

        const {data: bookData, error: bookError} = await this.dbClient.from(DatabaseConstants.BookTable.TABLE_NAME)
            .select(`${DatabaseConstants.BookTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME}, ${DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME}, ${DatabaseConstants.PublisherTable.TABLE_NAME}(${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME})`)
            .eq(DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME, isbn);

        if (bookData && (bookData.length == 1)) {
            Log.d(BookRepositoryImpl.LOG_TAG, `Book with ISBN ${isbn} found.`);

            const authors = await this.getBookAuthorsData(bookData[0][DatabaseConstants.BookTable.Fields.ID_FIELD_NAME]);

            book = this.bookMapper.fromDBBook(bookData[0], authors);
        } else if (bookError) {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not retrieve book by ISBN ${isbn}. Error: ${bookError.message}.`);

            throw Error(`Could not retrieve book by ISBN ${isbn}. Error: ${bookError.message}.`);
        } else {
            Log.d(BookRepositoryImpl.LOG_TAG, `Book with ISBN ${isbn} not found.`)
        }

        return book;
    }

    async createBook(book: Book): Promise<Book> {
        // This whole book inserting should be done using a transaction, however Supabase doesn't support it.
        Log.d(BookRepositoryImpl.LOG_TAG, `Creating book ${JSON.stringify(book)}...`);

        const {data: bookData, error: bookError} = await this.dbClient
            .from(DatabaseConstants.BookTable.TABLE_NAME)
            .insert({
                [DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME]: book.title,
                [DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME]: book.isbn,
                [DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME]: book.year,
                [DatabaseConstants.BookTable.Fields.PUBLISHER_ID_FIELD_NAME]: book.publisher.id
            })
            .select();

        if (bookData) {
            const bookId = bookData[0][DatabaseConstants.BookTable.Fields.ID_FIELD_NAME] as number;

            await this.createBookAuthors(bookId, book.authors);

            Log.d(BookRepositoryImpl.LOG_TAG, `Book ${JSON.stringify(book)} created successfully.`);

            return this.bookMapper.fromDBBook(bookData, book.authors)!;
        } else {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not create book ${JSON.stringify(book)}: ${bookError.message}`);

            throw Error(`Could not create book ${JSON.stringify(book)}: ${bookError.message}`);
        }
    }

    async deleteBook(id: number): Promise<boolean> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Deleting book id ${id}...`);

        const book = await this.getBookById(id);

        let deleted = false;

        if (book != null) {
            await this.deleteBookAuthors(id)

            const {error: bookError} = await this.dbClient
                .from(DatabaseConstants.BookTable.TABLE_NAME)
                .delete()
                .eq(DatabaseConstants.BookTable.Fields.ID_FIELD_NAME, id);

            if (bookError) {
                Log.e(BookRepositoryImpl.LOG_TAG, `Could not delete book by id ${id}. Error: ${bookError?.message}.`);

                throw Error(`Could not delete book by id ${id}. Error: ${bookError?.message}.`);
            } else {
                deleted = true;

                Log.d(BookRepositoryImpl.LOG_TAG, `Book id ${id} deleted successfully.`);
            }
        } else {
            Log.d(BookRepositoryImpl.LOG_TAG, `Could not delete book id ${id}. Book doesn't exist.`);
        }

        return deleted;
    }

    async updateBook(book: Book): Promise<boolean> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Updating book id ${book.id}...`);

        const existingBook = await this.getBookById(book.id);

        let updated = false;

        if (existingBook != null) {
            const {error: bookError} = await this.dbClient
                .from(DatabaseConstants.BookTable.TABLE_NAME)
                .update({
                    [DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME]: book.title,
                    [DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME]: book.isbn,
                    [DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME]: book.year,
                    [DatabaseConstants.BookTable.Fields.PUBLISHER_ID_FIELD_NAME]: book.publisher.id
                })
                .eq(DatabaseConstants.BookTable.Fields.ID_FIELD_NAME, book.id);

            if (bookError) {
                Log.e(BookRepositoryImpl.LOG_TAG, `Could not update book by id ${book.id}. Error: ${bookError?.message}.`);

                throw Error(`Could not update book by id ${book.id}. Error: ${bookError?.message}.`);
            } else {
                await this.deleteBookAuthors(book.id);
                await this.createBookAuthors(book.id, book.authors)

                updated = true;

                Log.d(BookRepositoryImpl.LOG_TAG, `Book id ${book.id} updated successfully.`);
            }
        } else {
            Log.d(BookRepositoryImpl.LOG_TAG, `Could not update book id ${book.id}. Book doesn't exist.`);
        }

        return updated;
    }

    private async getBookAuthorsData(bookId: number): Promise<Array<Author>> {
        Log.d(BookRepositoryImpl.LOG_TAG, `Retrieving book id ${bookId} authors data...`);

        const {
            data: authorsData,
            error: authorsError
        } = await this.dbClient.from(DatabaseConstants.AuthorBooksTable.TABLE_NAME)
            .select(`...${DatabaseConstants.AuthorTable.TABLE_NAME}!inner(${DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME})`)
            .eq(`${DatabaseConstants.AuthorBooksTable.Fields.BOOK_ID_FIELD_NAME}`, bookId);

        const authors = new Array<Author>();

        if (authorsData) {
            Log.d(BookRepositoryImpl.LOG_TAG, `Authors data for book id ${bookId} found. Number of authors: ${authorsData.length}.`);

            authorsData.forEach(authorData => {
                const author = this.authorMapper.fromDBAuthor(authorData)

                if (author) {
                    authors.push(author);
                }
            })
        } else {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not retrieve authors data for book id ${bookId}. Error: ${authorsError}.`);
        }

        return authors;
    }

    private async createBookAuthors(bookId: number, authors: Array<Author>) {
        for (let author of authors) {
            const {error: error} = await this.dbClient
                .from(DatabaseConstants.AuthorBooksTable.TABLE_NAME)
                .insert({
                    [DatabaseConstants.AuthorBooksTable.Fields.BOOK_ID_FIELD_NAME]: bookId,
                    [DatabaseConstants.AuthorBooksTable.Fields.AUTHOR_ID_FIELD_NAME]: author.id as number
                });

            if (error) {
                Log.e(BookRepositoryImpl.LOG_TAG, `Could not create the relation between book id ${bookId} and author id ${author.id}: ${error.message}`);

                throw Error(`Could not create the relation between book id ${bookId} and author id ${author.id}: ${error.message}`);
            }
        }
    }

    private async deleteBookAuthors(bookId: number) {
        const {error: authorBooksError} = await this.dbClient
            .from(DatabaseConstants.AuthorBooksTable.TABLE_NAME)
            .delete()
            .eq(DatabaseConstants.AuthorBooksTable.Fields.BOOK_ID_FIELD_NAME, bookId);

        if (authorBooksError) {
            Log.e(BookRepositoryImpl.LOG_TAG, `Could not delete book authors by book id ${bookId}. Error: ${authorBooksError?.message}.`);

            throw Error(`Could not delete book authors by book id ${bookId}. Error: ${authorBooksError?.message}.`);
        }
    }
}
