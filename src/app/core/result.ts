export type LMResult<T> =
    | { success: true; data: T }
    | { success: false; error: Error };

export const LMResult = {
    ok<T>(data: T): LMResult<T> {
        return { success: true, data }
    },
    error<T = never>(error: Error): LMResult<T> {
        return { success: false, error }
    }
}