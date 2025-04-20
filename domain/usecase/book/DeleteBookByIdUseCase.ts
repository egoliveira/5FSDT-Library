import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {BookRepository} from "../../../domain/repository/BookRepository";

@injectable()
export class DeleteBookByIdUseCase implements UseCase<number, boolean> {
    private readonly bookRepository: BookRepository;

    constructor(@inject("BookRepository") bookRepository: BookRepository) {
        this.bookRepository = bookRepository
    }

    execute(params: number): Promise<boolean> {
        return this.bookRepository.deleteBook(params);
    }
}