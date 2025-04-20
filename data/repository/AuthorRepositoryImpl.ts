import {AuthorRepository} from "../../domain/repository/AuthorRepository";
import {Author} from "../../domain/vo/Author";
import {AuthorMapper} from "../mapper/AuthorMapper";
import {Database} from "../vo/database.types";
import {SupabaseClient} from '@supabase/supabase-js';
import {Log} from "../../util/Log";
import {DatabaseConstants} from "./DatabaseConstants";

export class AuthorRepositoryImpl implements AuthorRepository {
    private static readonly LOG_TAG = "AuthorRepositoryImpl";

    private readonly dbClient: SupabaseClient<Database>;

    private readonly authorMapper: AuthorMapper;

    constructor(
        dbClient: SupabaseClient<Database>,
        authorMapper: AuthorMapper
    ) {
        this.dbClient = dbClient;
        this.authorMapper = authorMapper;
    }

    async getAuthors(): Promise<Array<Author>> {
        Log.d(AuthorRepositoryImpl.LOG_TAG, `Retrieving all authors...`);

        const authors = new Array<Author>();

        const {
            data: authorData,
            error: authorError
        } = await this.dbClient.from(DatabaseConstants.AuthorTable.TABLE_NAME)
            .select(`${DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME}`);

        if (authorData) {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Number of authors found: ${authorData.length}.`);

            for (const authorInfo of authorData) {
                const author = this.authorMapper.fromDBAuthor(authorInfo);

                if (author != null) {
                    authors.push(author);
                }
            }
        } else {
            Log.e(AuthorRepositoryImpl.LOG_TAG, `Could not retrieve all authors. Error: ${authorError.message}.`);
        }

        return authors;
    }

    async getAuthorById(id: number): Promise<Author | null> {
        Log.d(AuthorRepositoryImpl.LOG_TAG, `Retrieving author id ${id}...`);

        let author: Author | null = null;

        const {
            data: authorData,
            error: authorError
        } = await this.dbClient.from(DatabaseConstants.AuthorTable.TABLE_NAME)
            .select(`${DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME}`)
            .eq(DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME, id);

        if (authorData && (authorData.length == 1)) {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Author id ${id} found.`);

            author = this.authorMapper.fromDBAuthor(authorData[0]);
        } else if (authorError) {
            Log.e(AuthorRepositoryImpl.LOG_TAG, `Could not retrieve author by id ${id}. Error: ${authorError.message}.`);

            throw Error(`Could not retrieve author by id ${id}. Error: ${authorError.message}.`);
        } else {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Author id ${id} not found.`)
        }

        return author;
    }

    async getAuthorByName(name: string): Promise<Author | null> {
        Log.d(AuthorRepositoryImpl.LOG_TAG, `Retrieving author by name ${name}...`);

        let author: Author | null = null;

        const {
            data: authorData,
            error: authorError
        } = await this.dbClient.from(DatabaseConstants.AuthorTable.TABLE_NAME)
            .select(`${DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME}, ${DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME}`)
            .ilike(DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME, `%${name}%`);

        if (authorData && (authorData.length > 0)) {
            for (let i = 0; (i < authorData.length) && (author == null); i++) {
                let authorName = authorData[i][DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME];

                if (name.toLowerCase() == authorName.toLowerCase()) {
                    author = this.authorMapper.fromDBAuthor(authorData[i]);
                }
            }

            if (author != null) {
                Log.d(AuthorRepositoryImpl.LOG_TAG, `Author with name ${name} found.`);
            } else {
                Log.d(AuthorRepositoryImpl.LOG_TAG, `Author with name ${name} not found.`)
            }
        } else if (authorError) {
            Log.e(AuthorRepositoryImpl.LOG_TAG, `Could not retrieve author by name ${name}. Error: ${authorError.message}.`);

            throw Error(`Could not retrieve author by name ${name}. Error: ${authorError.message}.`);
        } else {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Author with name ${name} not found.`)
        }

        return author;
    }

    async createAuthor(author: Author): Promise<Author> {
        Log.d(AuthorRepositoryImpl.LOG_TAG, `Creating author ${JSON.stringify(author)}...`);

        const {data: authorData, error: authorError} = await this.dbClient
            .from(DatabaseConstants.AuthorTable.TABLE_NAME)
            .insert({
                [DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME]: author.name
            })
            .select();

        if (authorData) {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Author ${JSON.stringify(author)} created successfully.`);

            return this.authorMapper.fromDBAuthor(authorData[0])!;
        } else {
            Log.e(AuthorRepositoryImpl.LOG_TAG, `Could not create author ${JSON.stringify(author)}: ${authorError.message}`);

            throw Error(`Could not create author ${JSON.stringify(author)}: ${authorError.message}`);
        }
    }

    async deleteAuthor(id: number): Promise<boolean> {
        Log.d(AuthorRepositoryImpl.LOG_TAG, `Deleting author id ${id}...`);

        const author = await this.getAuthorById(id);

        let deleted = false;

        if (author != null) {
            const {error: authorError} = await this.dbClient
                .from(DatabaseConstants.AuthorTable.TABLE_NAME)
                .delete()
                .eq(DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME, id);

            if (authorError) {
                Log.e(AuthorRepositoryImpl.LOG_TAG, `Could not delete author by id ${id}. Error: ${authorError?.message}.`);

                throw Error(`Could not delete author by id ${id}. Error: ${authorError?.message}.`);
            } else {
                deleted = true;

                Log.d(AuthorRepositoryImpl.LOG_TAG, `Author id ${id} deleted successfully.`);
            }
        } else {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Could not delete author id ${id}. Author doesn't exist.`);
        }

        return deleted;
    }

    async updateAuthor(author: Author): Promise<boolean> {
        Log.d(AuthorRepositoryImpl.LOG_TAG, `Updating author id ${author.id}...`);

        const existingAuthor = await this.getAuthorById(author.id);

        let updated = false;

        if (existingAuthor != null) {
            const {error: authorError} = await this.dbClient
                .from(DatabaseConstants.AuthorTable.TABLE_NAME)
                .update({
                    [DatabaseConstants.AuthorTable.Fields.NAME_FIELD_NAME]: author.name
                })
                .eq(DatabaseConstants.AuthorTable.Fields.ID_FIELD_NAME, author.id);

            if (authorError) {
                Log.e(AuthorRepositoryImpl.LOG_TAG, `Could not update author by id ${author.id}. Error: ${authorError?.message}.`);

                throw Error(`Could not update author by id ${author.id}. Error: ${authorError?.message}.`);
            } else {
                updated = true;

                Log.d(AuthorRepositoryImpl.LOG_TAG, `Author id ${author.id} updated successfully.`);
            }
        } else {
            Log.d(AuthorRepositoryImpl.LOG_TAG, `Could not update author id ${author.id}. Author doesn't exist.`);
        }

        return updated;
    }
}