import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {Author} from "../../vo/Author";
import {AuthorRepository} from "../../repository/AuthorRepository";

@injectable()
export class RetrieveAuthorByIdUseCase implements UseCase<number, Author | null> {
    private readonly authorRepository: AuthorRepository

    constructor(@inject("AuthorRepository") authorRepository: AuthorRepository) {
        this.authorRepository = authorRepository
    }

    execute(params: number): Promise<Author | null> {
        return this.authorRepository.getAuthorById(params);
    }
}