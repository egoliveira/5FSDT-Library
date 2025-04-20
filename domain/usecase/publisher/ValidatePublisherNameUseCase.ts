import { injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { Log } from "../../../util/Log";

@injectable()
export class ValidatePublisherNameUseCase implements UseCase<any, string> {
    private static readonly LOG_TAG = "ValidatePublisherNameUseCase";

    private static readonly PUBLISHER_NAME_MAX_LENGTH = 150;

    async execute(params: any): Promise<string> {
        Log.d(ValidatePublisherNameUseCase.LOG_TAG, `Validating publisher name ${params}...`);

        if (typeof params != 'string') {
            Log.e(ValidatePublisherNameUseCase.LOG_TAG, `Invalid publisher name type`);

            throw Error(`Invalid publisher name type`)
        } else {
            const author = params.trim();

            if (author.length == 0) {
                Log.e(ValidatePublisherNameUseCase.LOG_TAG, `Empty publisher name`);

                throw Error(`Empty publisher name`);
            } else if (author.length > ValidatePublisherNameUseCase.PUBLISHER_NAME_MAX_LENGTH) {
                Log.e(ValidatePublisherNameUseCase.LOG_TAG, `Publiher name is longer than expected`);

                throw Error(`Publiher name is longer than expected`);
            } else {
                Log.d(ValidatePublisherNameUseCase.LOG_TAG, `Publisher name ${params} is valid.`);

                return author;
            }
        }
    }
}