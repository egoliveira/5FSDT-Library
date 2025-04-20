export class Log {
    private static readonly DEBUG_LEVEL = "DEBUG";

    private static readonly ERROR_LEVEL = "ERROR";

    static d(tag: string, message: string) {
        this.printLog(tag, this.DEBUG_LEVEL, message);
    }

    static e(tag: string, message: string) {
        this.printLog(tag, this.ERROR_LEVEL, message);
    }

    private static printLog(tag: string, level: string, message: string) {
        console.log(`${level}\t${tag}\t${message}`);
    }
}