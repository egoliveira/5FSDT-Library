import { injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { Log } from "../../../util/Log";

@injectable()
export class ValidateBookYearUseCase implements UseCase<any, number> {
    private static readonly LOG_TAG = "ValidateBookYearUseCase";

    private static readonly MIN_YEAR_ALLOWED = 1500;

    async execute(params: any): Promise<number> {
        Log.d(ValidateBookYearUseCase.LOG_TAG, `Validating book year ${params}...`);

        if ((typeof params != 'number') || (!Number.isInteger(params))) {
            Log.e(ValidateBookYearUseCase.LOG_TAG, `Invalid book year type`);

            throw Error("Invalid book year type");
        } else {
            const year = params as number;

            if ((year < ValidateBookYearUseCase.MIN_YEAR_ALLOWED) || (year > new Date().getFullYear())) {
                Log.e(ValidateBookYearUseCase.LOG_TAG, `Invalid book year value`);

                throw Error("Invalid book year value");
            } else {
                Log.d(ValidateBookYearUseCase.LOG_TAG, `Book year ${params} is valid.`);

                return year;
            }
        }
    }
    
}