import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {AuthorRepository} from "../../repository/AuthorRepository";

@injectable()
export class DeleteAuthorByIdUseCase implements UseCase<number, boolean> {
    private readonly authorRepository: AuthorRepository

    constructor(@inject("AuthorRepository") authorRepository: AuthorRepository) {
        this.authorRepository = authorRepository
    }

    execute(params: number): Promise<boolean> {
        return this.authorRepository.deleteAuthor(params);
    }
}