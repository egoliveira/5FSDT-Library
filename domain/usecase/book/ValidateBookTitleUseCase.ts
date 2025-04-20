import { injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { Log } from "../../../util/Log";

@injectable()
export class ValidateBookTitleUseCase implements UseCase<any, string> {
    private static readonly LOG_TAG = "ValidateBookTitleUseCase";

    private static readonly BOOK_TITLE_MAX_LENGTH = 150;

    async execute(params: any): Promise<string> {
        Log.d(ValidateBookTitleUseCase.LOG_TAG, `Validating book title ${params}...`);

        if (typeof params != 'string') {
            Log.e(ValidateBookTitleUseCase.LOG_TAG, `Invalid book title type`);

            throw Error(`Invalid book title type`);
        } else {
            const bookTitle = params.trim();

            if (bookTitle.length == 0) {
                Log.e(ValidateBookTitleUseCase.LOG_TAG, `Empty book title`);

                throw Error(`Empty book title`);
            } else if (bookTitle.length > ValidateBookTitleUseCase.BOOK_TITLE_MAX_LENGTH) {
                Log.e(ValidateBookTitleUseCase.LOG_TAG, `Book title is longer than expected`);

                throw Error(`Book title is longer than expected`);
            } else {
                Log.d(ValidateBookTitleUseCase.LOG_TAG, `Book title ${params} is valid.`);

                return bookTitle;
            }
        }
    }
}