import {Author} from './Author'
import {Publisher} from './Publisher'

export class Book {
    public readonly id: number

    public readonly title: string

    public readonly isbn: string

    public readonly year: number

    public readonly authors: Array<Author>

    public readonly publisher: Publisher

    constructor(id: number, title: string, isbn: string, year: number, authors: Array<Author>, publisher: Publisher) {
        this.id = id
        this.title = title
        this.isbn = isbn
        this.year = year
        this.authors = authors
        this.publisher = publisher
    }
}
