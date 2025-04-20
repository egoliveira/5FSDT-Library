import { injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { Log } from "../../../util/Log";

@injectable()
export class ValidateAuthorNameUseCase implements UseCase<any, string> {
    private static readonly LOG_TAG = "ValidateAuthorNameUseCase";

    private static readonly AUTHOR_NAME_MAX_LENGTH = 150;

    async execute(params: any): Promise<string> {
        Log.d(ValidateAuthorNameUseCase.LOG_TAG, `Validating author name ${params}...`);

        if (typeof params != 'string') {
            Log.e(ValidateAuthorNameUseCase.LOG_TAG, `Invalid author name type`);

            throw Error(`Invalid author name type`)
        } else {
            const author = params.trim();

            if (author.length == 0) {
                Log.e(ValidateAuthorNameUseCase.LOG_TAG, `Empty author name`);

                throw Error(`Empty author name`);
            } else if (author.length > ValidateAuthorNameUseCase.AUTHOR_NAME_MAX_LENGTH) {
                Log.e(ValidateAuthorNameUseCase.LOG_TAG, `Author name is longer than expected`);

                throw Error(`Author name is longer than expected`);
            } else {
                Log.d(ValidateAuthorNameUseCase.LOG_TAG, `Author name ${params} is valid.`);

                return author;
            }
        }
    }
}