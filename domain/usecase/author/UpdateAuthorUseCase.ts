import {UseCase} from "../../../domain/usecase/UseCase";
import {inject, injectable} from "tsyringe";
import {Log} from "../../../util/Log";
import {AuthorRepository} from "../../../domain/repository/AuthorRepository";
import {Author} from "../../../domain/vo/Author";

@injectable()
export class UpdateAuthorUseCase implements UseCase<UpdateAuthorUseCaseParams, boolean> {
    private static readonly LOG_TAG = "UpdateAuthorUseCaseParams";

    private readonly authorRepository: AuthorRepository;

    constructor(@inject("AuthorRepository") authorRepository: AuthorRepository) {
        this.authorRepository = authorRepository;
    }

    async execute(params: UpdateAuthorUseCaseParams): Promise<boolean> {
        Log.d(UpdateAuthorUseCase.LOG_TAG, `Updating author with parameters ${JSON.stringify(params)}...`);

        const existingAuthor = await this.authorRepository.getAuthorById(params.id);

        if (existingAuthor != null) {
            const duplicateAuthor = await this.authorRepository.getAuthorByName(params.name);

            if ((duplicateAuthor != null) && (duplicateAuthor.id != existingAuthor.id)) {
                Log.e(UpdateAuthorUseCase.LOG_TAG, `Can't update an author with parameters ${JSON.stringify(params)}. The given author name is already in use.`);

                throw Error(`Can't update an author with parameters ${JSON.stringify(params)}. The given author name is already in use.`);
            } else {
                const author = new Author(
                    existingAuthor.id,
                    params.name
                )

                const updated = await this.authorRepository.updateAuthor(author);

                if (updated) {
                    Log.d(UpdateAuthorUseCase.LOG_TAG, `Author with parameters ${JSON.stringify(params)} updated successfully.`);
                } else {
                    Log.d(UpdateAuthorUseCase.LOG_TAG, `Author with parameters ${JSON.stringify(params)} didn't updated.`);
                }

                return updated;
            }
        } else {
            Log.e(UpdateAuthorUseCase.LOG_TAG, `Can't update an author with parameters ${JSON.stringify(params)}. There isn't an author with the given author id.`);

            throw Error(`Can't update an author with parameters ${JSON.stringify(params)}. There isn't an author with the given author id.`);
        }
    }
}

export class UpdateAuthorUseCaseParams {
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