import {Publisher} from "../../domain/vo/Publisher";
import {PublisherRepository} from "../../domain/repository/PublisherRepository";
import {Database} from "../vo/database.types";
import {SupabaseClient} from '@supabase/supabase-js';
import {PublisherMapper} from "../mapper/PublisherMapper";
import {Log} from "../../util/Log";
import {DatabaseConstants} from "./DatabaseConstants";

export class PublisherRepositoryImpl implements PublisherRepository {
    private static readonly LOG_TAG = "PublisherRepositoryImpl";

    private readonly dbClient: SupabaseClient<Database>;

    private readonly publisherMapper: PublisherMapper;

    constructor(
        dbClient: SupabaseClient<Database>,
        publisherMapper: PublisherMapper
    ) {
        this.dbClient = dbClient;
        this.publisherMapper = publisherMapper;
    }

    async getPublishers(): Promise<Array<Publisher>> {
        Log.d(PublisherRepositoryImpl.LOG_TAG, `Retrieving all publishers...`);

        const publishers = new Array<Publisher>();

        const {
            data: publisherData,
            error: publisherError
        } = await this.dbClient.from(DatabaseConstants.PublisherTable.TABLE_NAME)
            .select(`${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME}`);

        if (publisherData) {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Number of publishers found: ${publisherData.length}.`);

            for (const publisherInfo of publisherData) {
                const publisher = this.publisherMapper.fromDBPublisher(publisherInfo);

                if (publisher != null) {
                    publishers.push(publisher);
                }
            }
        } else {
            Log.e(PublisherRepositoryImpl.LOG_TAG, `Could not retrieve all publishers. Error: ${publisherError.message}.`);
        }

        return publishers;
    }

    async getPublisherById(id: number): Promise<Publisher | null> {
        Log.d(PublisherRepositoryImpl.LOG_TAG, `Retrieving publisher id ${id}...`);

        let publisher: Publisher | null = null;

        const {
            data: publisherData,
            error: publisherError
        } = await this.dbClient.from(DatabaseConstants.PublisherTable.TABLE_NAME)
            .select(`${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME}`)
            .eq(DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME, id);

        if (publisherData && (publisherData.length == 1)) {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher id ${id} found.`);

            publisher = this.publisherMapper.fromDBPublisher(publisherData[0]);
        } else if (publisherError) {
            Log.e(PublisherRepositoryImpl.LOG_TAG, `Could not retrieve publisher by id ${id}. Error: ${publisherError.message}.`);

            throw Error(`Could not retrieve publisher by id ${id}. Error: ${publisherError.message}.`);
        } else {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher id ${id} not found.`)
        }

        return publisher;
    }

    async getPublisherByName(name: string): Promise<Publisher | null> {
        Log.d(PublisherRepositoryImpl.LOG_TAG, `Retrieving publisher by name ${name}...`);

        let publisher: Publisher | null = null;

        const {
            data: publisherData,
            error: publisherError
        } = await this.dbClient.from(DatabaseConstants.PublisherTable.TABLE_NAME)
            .select(`${DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME}`)
            .ilike(DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME, `%${name}%`);

        if (publisherData && (publisherData.length > 0)) {
            for (let i = 0; (i < publisherData.length) && (publisher == null); i++) {
                let publisherName = publisherData[i][DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME];

                if (name.toLowerCase() == publisherName.toLowerCase()) {
                    publisher = this.publisherMapper.fromDBPublisher(publisherData[i]);
                }
            }

            if (publisher != null) {
                Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher with name ${name} found.`);
            } else {
                Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher with name ${name} not found.`)
            }
        } else if (publisherError) {
            Log.e(PublisherRepositoryImpl.LOG_TAG, `Could not retrieve publisher by name ${name}. Error: ${publisherError}.`);

            throw Error(`Could not retrieve publisher by name ${name}. Error: ${publisherError}.`);
        } else {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher with name ${name} not found.`)
        }

        return publisher;
    }

    async createPublisher(publisher: Publisher): Promise<Publisher> {
        Log.d(PublisherRepositoryImpl.LOG_TAG, `Creating publisher ${JSON.stringify(publisher)}...`);

        const {data: publisherData, error: publisherError} = await this.dbClient
            .from(DatabaseConstants.PublisherTable.TABLE_NAME)
            .insert({
                [DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME]: publisher.name
            })
            .select();

        if (publisherData) {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher ${JSON.stringify(publisher)} created successfully.`);

            return this.publisherMapper.fromDBPublisher(publisherData[0])!;
        } else {
            Log.e(PublisherRepositoryImpl.LOG_TAG, `Could not create publisher ${JSON.stringify(publisher)}: ${publisherError.message}`);

            throw Error(`Could not create publisher ${JSON.stringify(publisher)}: ${publisherError.message}`);
        }
    }

    async deletePublisher(id: number): Promise<boolean> {
        Log.d(PublisherRepositoryImpl.LOG_TAG, `Deleting publisher id ${id}...`);

        const publisher = await this.getPublisherById(id);

        let deleted = false;

        if (publisher != null) {
            const {error: publisherError} = await this.dbClient
                .from(DatabaseConstants.PublisherTable.TABLE_NAME)
                .delete()
                .eq(DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME, id);

            if (publisherError) {
                Log.e(PublisherRepositoryImpl.LOG_TAG, `Could not delete publisher by id ${id}. Error: ${publisherError?.message}.`);

                throw Error(`Could not delete publisher by id ${id}. Error: ${publisherError?.message}.`);
            } else {
                deleted = true;

                Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher id ${id} deleted successfully.`);
            }
        } else {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Could not delete publisher id ${id}. Publisher doesn't exist.`);
        }

        return deleted;
    }

    async updatePublisher(publisher: Publisher): Promise<boolean> {
        Log.d(PublisherRepositoryImpl.LOG_TAG, `Updating publisher id ${publisher.id}...`);

        const existingPublisher = await this.getPublisherById(publisher.id);

        let updated = false;

        if (existingPublisher != null) {
            const {error: publisherError} = await this.dbClient
                .from(DatabaseConstants.PublisherTable.TABLE_NAME)
                .update({
                    [DatabaseConstants.PublisherTable.Fields.NAME_FIELD_NAME]: publisher.name
                })
                .eq(DatabaseConstants.PublisherTable.Fields.ID_FIELD_NAME, publisher.id);

            if (publisherError) {
                Log.e(PublisherRepositoryImpl.LOG_TAG, `Could not update publisher by id ${publisher.id}. Error: ${publisherError?.message}.`);

                throw Error(`Could not update publihser by id ${publisher.id}. Error: ${publisherError?.message}.`);
            } else {
                updated = true;

                Log.d(PublisherRepositoryImpl.LOG_TAG, `Publisher id ${publisher.id} updated successfully.`);
            }
        } else {
            Log.d(PublisherRepositoryImpl.LOG_TAG, `Could not update publisher id ${publisher.id}. Publisher doesn't exist.`);
        }

        return updated;
    }
}