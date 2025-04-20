import {Book} from "../vo/Book";

export interface BookRepository {
    getBooks(): Promise<Array<Book>>;

    getBookById(id: number): Promise<Book | null>;

    getBookByTitle(title: string): Promise<Book | null>;

    getBookByISBN(isbn: string): Promise<Book | null>;

    createBook(book: Book): Promise<Book>;

    deleteBook(id: number): Promise<boolean>;

    updateBook(book: Book): Promise<boolean>;
}