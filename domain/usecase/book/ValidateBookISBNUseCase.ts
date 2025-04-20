import { injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { Log } from "../../../util/Log";

@injectable()
export class ValidateBookISBNUseCase implements UseCase<any, string> {
    private static readonly LOG_TAG = "ValidateBookISBNUseCase";

    private static readonly ISBN_LENGTH = 14;

    private static readonly ISBN_REGEX: RegExp = /^[0-9]{3}\-[0-9]{10}$/;

    async execute(params: any): Promise<string> {
        Log.d(ValidateBookISBNUseCase.LOG_TAG, `Validating book ISBN ${params}...`);

        if (typeof params != 'string') {
            Log.e(ValidateBookISBNUseCase.LOG_TAG, `Invalid book ISBN type`);

            throw Error("Invalid book ISBN type");
        } else {
            const isbn = params.trim();

            if (isbn.length == 0) {
                Log.e(ValidateBookISBNUseCase.LOG_TAG, `Empty book ISBN`);

                throw Error("Empty book ISBN");
            } else if (isbn.length != ValidateBookISBNUseCase.ISBN_LENGTH) {
                Log.e(ValidateBookISBNUseCase.LOG_TAG, `Book ISBN length is invalid`);

                throw Error("Book ISBN length is invalid.");
            } else if (!ValidateBookISBNUseCase.ISBN_REGEX.test(isbn)) {
                Log.e(ValidateBookISBNUseCase.LOG_TAG, `Book ISBN format is invalid`);

                throw Error("Book ISBN format is invalid.");
            } else {
                Log.d(ValidateBookISBNUseCase.LOG_TAG, `Book ISBN ${params} is valid.`);

                return isbn;
            }
        }
    }
}