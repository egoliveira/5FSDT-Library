import {Publisher} from "../vo/Publisher";

export interface PublisherRepository {
    getPublishers(): Promise<Array<Publisher>>;

    getPublisherByName(name: string): Promise<Publisher | null>

    getPublisherById(id: number): Promise<Publisher | null>;

    createPublisher(publisher: Publisher): Promise<Publisher>;

    deletePublisher(id: number): Promise<boolean>;

    updatePublisher(publisher: Publisher): Promise<boolean>;
}