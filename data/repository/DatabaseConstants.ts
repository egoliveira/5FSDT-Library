export class DatabaseConstants {
    static BookTable = class {
        static readonly TABLE_NAME = "book";

        static Fields = class {
            static readonly ID_FIELD_NAME = "id";

            static readonly ID_FIELD_TYPE = "number";

            static readonly TITLE_FIELD_NAME = "title";

            static readonly TITLE_FIELD_TYPE = "string";

            static readonly ISBN_FIELD_NAME = "isbn"

            static readonly ISBN_FIELD_TYPE = "string";

            static readonly YEAR_FIELD_NAME = "year";

            static readonly YEAR_FIELD_TYPE = "number";

            static readonly PUBLISHER_ID_FIELD_NAME = "publisher_id";
        }
    }

    static AuthorTable = class {
        static readonly TABLE_NAME = "author";

        static Fields = class {
            static readonly ID_FIELD_NAME = "id";

            static readonly ID_FIELD_TYPE = "number";

            static readonly NAME_FIELD_NAME = "name";

            static readonly NAME_FIELD_TYPE = "string";
        }
    }

    static PublisherTable = class {
        static readonly TABLE_NAME = "publisher";

        static Fields = class {
            static readonly ID_FIELD_NAME = "id";

            static readonly ID_FIELD_TYPE = "number";

            static readonly NAME_FIELD_NAME = "name";

            static readonly NAME_FIELD_TYPE = "string";
        }
    }

    static AuthorBooksTable = class {
        static readonly TABLE_NAME = "author_books";

        static Fields = class {
            static readonly ID_FIELD_NAME = "id";

            static readonly ID_FIELD_TYPE = "number";

            static readonly AUTHOR_ID_FIELD_NAME = "author_id";

            static readonly AUTHOR_ID_FIELD_TYPE = "number";

            static readonly BOOK_ID_FIELD_NAME = "book_id";

            static readonly BOOK_ID_FIELD_TYPE = "number";
        }
    }
}