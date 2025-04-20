import {UseCase} from "../../../domain/usecase/UseCase";
import {PublisherRepository} from "../../../domain/repository/PublisherRepository";
import {inject, injectable} from "tsyringe";
import {Log} from "../../../util/Log";
import {Publisher} from "../../../domain/vo/Publisher";

@injectable()
export class CreatePublisherUseCase implements UseCase<CreatePublisherUseCaseParams, void> {
    private static readonly LOG_TAG = "CreatePublisherUseCase";

    private readonly publisherRepository: PublisherRepository;

    constructor(@inject("PublisherRepository") publisherRepository: PublisherRepository) {
        this.publisherRepository = publisherRepository;
    }

    async execute(params: CreatePublisherUseCaseParams): Promise<void> {
        Log.d(CreatePublisherUseCase.LOG_TAG, `Creating publisher with parameters ${JSON.stringify(params)}...`);

        const existingPublisher = await this.publisherRepository.getPublisherByName(params.name);

        if (existingPublisher == null) {
            const publisher = new Publisher(
                0,
                params.name
            )

            await this.publisherRepository.createPublisher(publisher);

            Log.d(CreatePublisherUseCase.LOG_TAG, `Publisher with parameters ${JSON.stringify(params)} created successfully.`);
        } else {
            Log.e(CreatePublisherUseCase.LOG_TAG, `Can't create a publisher with parameters ${JSON.stringify(params)}. There's a publisher with this name already.`);

            throw Error(`Can't create a publisher with parameters ${JSON.stringify(params)}. There's a publisher with this name already.`);
        }
    }


}

export class CreatePublisherUseCaseParams {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }
}