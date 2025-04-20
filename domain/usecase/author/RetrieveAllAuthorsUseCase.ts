import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {Author} from "../../../domain/vo/Author";
import {AuthorRepository} from "../../../domain/repository/AuthorRepository";

@injectable()
export class RetrieveAllAuthorsUseCase implements UseCase<void, Array<Author>> {
    private readonly authorRepository: AuthorRepository

    constructor(@inject("AuthorRepository") authorRepository: AuthorRepository) {
        this.authorRepository = authorRepository
    }

    execute(): Promise<Array<Author>> {
        return this.authorRepository.getAuthors()
    }
}