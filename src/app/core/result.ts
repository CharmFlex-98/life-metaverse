export type LMResult<T> =
    | { success: true; data: T }
    | { success: false; error: Error };

export namespace LMResult {
    export function ok<T>(data: T): LMResult<T> {
        return { success: true, data }
    }

    export function error<T = never>(error: Error): LMResult<T> {
        return { success: false, error }
    }
}