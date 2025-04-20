import {container} from "tsyringe";
import {BookRepository} from "../domain/repository/BookRepository";
import {BookRepositoryImpl} from "../data/repository/BookRepositoryImpl";
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {Database} from '../data/vo/database.types';
import {AuthorMapper} from "../data/mapper/AuthorMapper";
import {BookMapper} from "../data/mapper/BookMapper";
import {PublisherRepository} from "../domain/repository/PublisherRepository";
import {PublisherRepositoryImpl} from "../data/repository/PublisherRepositoryImpl";
import {PublisherMapper} from "../data/mapper/PublisherMapper";
import {AuthorRepository} from "../domain/repository/AuthorRepository";
import {AuthorRepositoryImpl} from "../data/repository/AuthorRepositoryImpl";

// **********
// Data layer
// **********
const supabase = createClient<Database>('https://database_url.supabase.co', 'access_key');

container.register<SupabaseClient>("SupabaseClient", {
    useValue: supabase
});

container.register<BookRepository>("BookRepository", {
    useValue: new BookRepositoryImpl(
        supabase,
        container.resolve<AuthorMapper>(AuthorMapper),
        container.resolve<BookMapper>(BookMapper)
    )
});

container.register<PublisherRepository>("PublisherRepository", {
    useValue: new PublisherRepositoryImpl(
        supabase,
        container.resolve<PublisherMapper>(PublisherMapper)
    )
});

container.register<AuthorRepository>("AuthorRepository", {
    useValue: new AuthorRepositoryImpl(
        supabase,
        container.resolve<AuthorMapper>(AuthorMapper)
    )
});

export {container};