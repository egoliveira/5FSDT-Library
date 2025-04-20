import {UseCase} from "../../../domain/usecase/UseCase";
import {inject, injectable} from "tsyringe";
import {Log} from "../../../util/Log";
import {PublisherRepository} from "../../../domain/repository/PublisherRepository";
import {Publisher} from "../../../domain/vo/Publisher";

@injectable()
export class UpdatePublisherUseCase implements UseCase<UpdatePublisherUseCaseParams, boolean> {
    private static readonly LOG_TAG = "UpdatePublisherUseCase";

    private readonly publisherRepository: PublisherRepository;

    constructor(@inject("PublisherRepository") publisherRepository: PublisherRepository) {
        this.publisherRepository = publisherRepository;
    }

    async execute(params: UpdatePublisherUseCaseParams): Promise<boolean> {
        Log.d(UpdatePublisherUseCase.LOG_TAG, `Updating publisher with parameters ${JSON.stringify(params)}...`);

        const existingPublisher = await this.publisherRepository.getPublisherById(params.id);

        if (existingPublisher != null) {
            const duplicatePublisher = await this.publisherRepository.getPublisherByName(params.name);

            if ((duplicatePublisher != null) && (duplicatePublisher.id != existingPublisher.id)) {
                Log.e(UpdatePublisherUseCase.LOG_TAG, `Can't update a publisher with parameters ${JSON.stringify(params)}. The given publisher name is already in use.`);

                throw Error(`Can't update a publisher with parameters ${JSON.stringify(params)}. The given publisher name is already in use.`);
            } else {
                const publisher = new Publisher(
                    existingPublisher.id,
                    params.name
                )

                const updated = await this.publisherRepository.updatePublisher(publisher);

                if (updated) {
                    Log.d(UpdatePublisherUseCase.LOG_TAG, `Publisher with parameters ${JSON.stringify(params)} updated successfully.`);
                } else {
                    Log.d(UpdatePublisherUseCase.LOG_TAG, `Publisher with parameters ${JSON.stringify(params)} didn't updated.`);
                }

                return updated;
            }
        } else {
            Log.e(UpdatePublisherUseCase.LOG_TAG, `Can't update a publisher with parameters ${JSON.stringify(params)}. There isn't a publisher with the given publisher id.`);

            throw Error(`Can't update a publisher with parameters ${JSON.stringify(params)}. There isn't a publisher with the given publisher id.`);
        }
    }
}

export class UpdatePublisherUseCaseParams {
    private readonly _id: number;

    private readonly _name: string;

    constructor(id: number, name: string) {
        this._id = id;
        this._name = name;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }
}