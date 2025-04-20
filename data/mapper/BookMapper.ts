import {Book} from "../../domain/vo/Book";
import {inject, injectable} from "tsyringe";
import {DatabaseConstants} from "../repository/DatabaseConstants";
import {PublisherMapper} from "./PublisherMapper";
import {Publisher} from "../../domain/vo/Publisher";
import {Author} from "../../domain/vo/Author";

@injectable()
export class BookMapper {
    private publisherMapper: PublisherMapper

    constructor(@inject(PublisherMapper) publisherMapper: PublisherMapper) {
        this.publisherMapper = publisherMapper;
    }

    fromDBBook(obj: any, authors: Array<Author>): Book | null {
        const id = obj[DatabaseConstants.BookTable.Fields.ID_FIELD_NAME];
        const title = obj[DatabaseConstants.BookTable.Fields.TITLE_FIELD_NAME];
        const isbn = obj[DatabaseConstants.BookTable.Fields.ISBN_FIELD_NAME];
        const year = obj[DatabaseConstants.BookTable.Fields.YEAR_FIELD_NAME];
        const publisherObj = obj[DatabaseConstants.PublisherTable.TABLE_NAME];
        let publisher: Publisher | null = null;

        if (publisherObj != null) {
            publisher = this.publisherMapper.fromDBPublisher(publisherObj);
        }

        let book: Book | null = null

        if ((typeof id == DatabaseConstants.BookTable.Fields.ID_FIELD_TYPE) &&
            (typeof title == DatabaseConstants.BookTable.Fields.TITLE_FIELD_TYPE) &&
            (typeof isbn == DatabaseConstants.BookTable.Fields.ISBN_FIELD_TYPE) &&
            (typeof year == DatabaseConstants.BookTable.Fields.YEAR_FIELD_TYPE) &&
            (publisher instanceof Publisher) &&
            (authors.length > 0)) {
            book = new Book(id, title, isbn, year, authors, publisher);
        }

        return book;
    }
}