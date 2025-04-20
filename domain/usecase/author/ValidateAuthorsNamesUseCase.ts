import { inject, injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { ValidateAuthorNameUseCase } from "./ValidateAuthorNameUseCase";
import { Log } from "../../../util/Log";

@injectable()
export class ValidateAuthorsNamesUseCase implements UseCase<any, Array<string>> {
    private static readonly LOG_TAG = "ValidateAuthorsNamesUseCase";

    private validateAuthorNameUseCase: ValidateAuthorNameUseCase

    constructor(@inject(ValidateAuthorNameUseCase) validateAuthorNameUseCase: ValidateAuthorNameUseCase) {
        this.validateAuthorNameUseCase = validateAuthorNameUseCase;
    }

    async execute(params: any): Promise<string[]> {
        Log.d(ValidateAuthorsNamesUseCase.LOG_TAG, `Validating authors names ${params}...`);

        if (!Array.isArray(params)) {
            Log.e(ValidateAuthorsNamesUseCase.LOG_TAG, `Invalid authors names type. An array is expected.`);

            throw Error("Invalid authors names type. An array is expected.");
        } else if (params.length == 0) {
            Log.e(ValidateAuthorsNamesUseCase.LOG_TAG, `Authors names not provided.`);

            throw Error("Authors names not provided");
        } else {
            const authors = new Array<string>();

            for (let i = 0; i < params.length; i++) {
                const authorName = params[i];

                try {
                    authors.push(await this.validateAuthorNameUseCase.execute(authorName));
                } catch (error) {
                    Log.e(ValidateAuthorsNamesUseCase.LOG_TAG, `Can't validate authors names.`);

                    if (error instanceof Error) {
                        throw Error(`${error.message} at index ${i}`);
                    } else {
                        throw Error(`Can't validate authors names.`);
                    }
                }
            }

            Log.d(ValidateAuthorsNamesUseCase.LOG_TAG, `Authors names ${params} are valid.`);

            return authors;
        }
    }

}