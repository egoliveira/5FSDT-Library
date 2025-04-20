import {BookRepository} from "@/domain/repository/BookRepository";
import {UseCase} from "../UseCase";
import {Book} from "@/domain/vo/Book";
import {inject, injectable} from "tsyringe";

@injectable()
export class RetrieveBookByIdUseCase implements UseCase<number, Book | null> {
    private readonly bookRepository: BookRepository

    constructor(@inject("BookRepository") bookRepository: BookRepository) {
        this.bookRepository = bookRepository
    }

    execute(params: number): Promise<Book | null> {
        return this.bookRepository.getBookById(params);
    }
}