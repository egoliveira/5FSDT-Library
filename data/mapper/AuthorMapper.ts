import {Author} from "../../domain/vo/Author";
import {injectable} from "tsyringe";
import {DatabaseConstants} from "../repository/DatabaseConstants";

@injectable()
export class AuthorMapper {
    fromDBAuthor(obj: any): Author | null {
        const id = obj[DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME];
        const name = obj[DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME];

        let author: Author | null = null;

        if ((typeof id == DatabaseConstants.AuthorTable.Fields.ID_FIELD_TYPE) &&
            (typeof name == DatabaseConstants.AuthorTable.Fields.NAME_FIELD_TYPE)) {
            author = new Author(id, name);
        }

        return author;
    }
}