import {UseCase} from "../../../domain/usecase/UseCase";
import {inject, injectable} from "tsyringe";
import {Log} from "../../../util/Log";
import {AuthorRepository} from "../../../domain/repository/AuthorRepository";
import {Author} from "../../../domain/vo/Author";

@injectable()
export class CreateAuthorUseCase implements UseCase<CreateAuthorUseCaseParams, void> {
    private static readonly LOG_TAG = "CreateAuthorUseCase";

    private readonly authorRepository: AuthorRepository;

    constructor(@inject("AuthorRepository") authorRepository: AuthorRepository) {
        this.authorRepository = authorRepository;
    }

    async execute(params: CreateAuthorUseCaseParams): Promise<void> {
        Log.d(CreateAuthorUseCase.LOG_TAG, `Creating author with parameters ${JSON.stringify(params)}...`);

        const existingAuthor = await this.authorRepository.getAuthorByName(params.name);

        if (existingAuthor == null) {
            const author = new Author(
                0,
                params.name
            )

            await this.authorRepository.createAuthor(author);

            Log.d(CreateAuthorUseCase.LOG_TAG, `Author with parameters ${JSON.stringify(params)} created successfully.`);
        } else {
            Log.e(CreateAuthorUseCase.LOG_TAG, `Can't create an author with parameters ${JSON.stringify(params)}. There's an author with this name already.`);

            throw Error(`Can't create an author with parameters ${JSON.stringify(params)}. There's an author with this name already.`);
        }
    }
}

export class CreateAuthorUseCaseParams {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }
}