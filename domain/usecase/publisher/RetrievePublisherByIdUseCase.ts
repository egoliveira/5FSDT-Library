import {UseCase} from "../UseCase";
import {inject, injectable} from "tsyringe";
import {Publisher} from "../../vo/Publisher";
import {PublisherRepository} from "../../repository/PublisherRepository";

@injectable()
export class RetrievePublisherByIdUseCase implements UseCase<number, Publisher | null> {
    private readonly publisherRepository: PublisherRepository

    constructor(@inject("PublisherRepository") publisherRepository: PublisherRepository) {
        this.publisherRepository = publisherRepository
    }

    execute(params: number): Promise<Publisher | null> {
        return this.publisherRepository.getPublisherById(params);
    }
}