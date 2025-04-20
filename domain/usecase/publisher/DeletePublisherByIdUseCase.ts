import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {PublisherRepository} from "../../repository/PublisherRepository";

@injectable()
export class DeletePublisherByIdUseCase implements UseCase<number, boolean> {
    private readonly publisherRepository: PublisherRepository

    constructor(@inject("PublisherRepository") publisherRepository: PublisherRepository) {
        this.publisherRepository = publisherRepository
    }

    execute(params: number): Promise<boolean> {
        return this.publisherRepository.deletePublisher(params);
    }
}