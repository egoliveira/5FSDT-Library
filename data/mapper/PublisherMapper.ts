import {Publisher} from "../../domain/vo/Publisher";
import {injectable} from "tsyringe";
import {DatabaseConstants} from "../repository/DatabaseConstants";

@injectable()
export class PublisherMapper {
    fromDBPublisher(obj: any): Publisher | null {
        const id = obj[DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME];
        const name = obj[DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME];

        let publisher: Publisher | null = null;

        if ((typeof id == DatabaseConstants.PublisherTable.Fields.ID_FIELD_TYPE) &&
            (typeof name == DatabaseConstants.PublisherTable.Fields.NAME_FIELD_TYPE)) {
            publisher = new Publisher(id, name);
        }

        return publisher;
    }
}