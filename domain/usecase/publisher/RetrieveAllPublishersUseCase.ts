import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {Publisher} from "../../../domain/vo/Publisher";
import {PublisherRepository} from "../../../domain/repository/PublisherRepository";

@injectable()
export class RetrieveAllPublishersUseCase implements UseCase<void, Array<Publisher>> {
    private readonly publisherRepository: PublisherRepository

    constructor(@inject("PublisherRepository") publisherRepository: PublisherRepository) {
        this.publisherRepository = publisherRepository
    }

    execute(): Promise<Array<Publisher>> {
        return this.publisherRepository.getPublishers();
    }
}