import {Author} from "../vo/Author";

export interface AuthorRepository {
    getAuthors(): Promise<Array<Author>>;

    getAuthorById(id: number): Promise<Author | null>;

    getAuthorByName(name: string): Promise<Author | null>;

    createAuthor(author: Author): Promise<Author>;

    deleteAuthor(id: number): Promise<boolean>;

    updateAuthor(author: Author): Promise<boolean>;
}