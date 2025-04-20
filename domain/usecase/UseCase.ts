export interface UseCase<P, R> {
    execute(params: P): Promise<R>
}