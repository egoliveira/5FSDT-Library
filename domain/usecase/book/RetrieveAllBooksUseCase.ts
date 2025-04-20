import {BookRepository} from "@/domain/repository/BookRepository";
import {UseCase} from "../UseCase";
import {Book} from "@/domain/vo/Book";
import {inject, injectable} from "tsyringe";

@injectable()
export class RetrieveAllBooksUseCase implements UseCase<void, Array<Book>> {
    private readonly bookRepository: BookRepository

    constructor(@inject("BookRepository") bookRepository: BookRepository) {
        this.bookRepository = bookRepository
    }

    execute(): Promise<Array<Book>> {
        return this.bookRepository.getBooks()
    }
}