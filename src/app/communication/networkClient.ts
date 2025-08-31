// lib/networkClient.ts
import {toast} from "sonner";
import {rejects} from "node:assert";
import {LMResult} from "@/app/core/result";
import {ErrorMessage} from "@/app/avatar/constants";
import {SERVER_DOMAIN} from "@/app/communication/constant";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class HttpError extends Error {
    constructor(private code: number, private errorBody: ErrorBody) {
        super();
        this.name = "HttpError";
        this.message = errorBody.errorMessage

        Object.setPrototypeOf(this, HttpError.prototype)
    }

    getCode(): number {
        return this.code;
    }

    getErrorBody(): ErrorBody {
        return this.errorBody;
    }
}
export interface HttpOptions<TBody = unknown> {
    method?: HttpMethod;
    body?: TBody;
    headers?: HeadersInit;
    cache?: RequestCache;
    defaultErrorHandler?: boolean// for Next.js fetch caching ("force-cache" | "no-store" etc.)
}

interface ErrorBody {
    errorCode: string,
    errorMessage: string
}

type ExceptionHandler = (err: unknown) => void;
const defaultExceptionHandler = (error: unknown) => {
    if (error instanceof HttpError) {
        toast.error(error.message)
        return
    }

    return toast.error("Unknown error occurred. Please try again later.")
}


export async function networkClient<TBody, TResponse = unknown>(
    endpoint: string,
    { method = "GET", body, headers, cache, defaultErrorHandler = true }: HttpOptions<TBody> = {},
): Promise<LMResult<TResponse>> {
    const BASE_URL = SERVER_DOMAIN ? `https://${SERVER_DOMAIN}` : "http://localhost:8081";
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache, // Optional: lets you control caching in Next.js
    });

    if (!res.ok) {
        const errorBody = await res.json();
        if ("errorCode" in errorBody && "errorMessage" in errorBody) {
            if (defaultErrorHandler) {
                toast.error(errorBody.errorMessage)
            }
            return LMResult.error(new HttpError(res.status, errorBody as ErrorBody))
        }

        const errorText = JSON.stringify(errorBody) ?? ErrorMessage.genericError

        if (defaultErrorHandler) {
            toast.error(errorText)
        }
        return LMResult.error(new Error(`HTTP ${res.status}: ${errorText}`))
    }

    const text = await res.text();
    // Void
    if (!text) {
        return LMResult.ok(undefined as TResponse);
    }

    return LMResult.ok(JSON.parse(text) as TResponse);
}



// Convenience wrappers
export const httpGet = <TResponse>(endpoint: string, options?: Omit<HttpOptions, "method" | "body">) =>
    networkClient<void, TResponse>(endpoint, { ...options, method: "GET" });

export const httpPost = <TBody, TResponse>(endpoint: string, body: TBody, options?: Omit<HttpOptions<TBody>, "method">) =>
    networkClient<TBody, TResponse>(endpoint, { ...options, method: "POST", body });

export const httpPut = <TBody, TResponse>(endpoint: string, body: TBody, options?: Omit<HttpOptions<TBody>, "method">) =>
    networkClient<TBody, TResponse>(endpoint, { ...options, method: "PUT", body });

export const httpDelete = <TResponse>(endpoint: string, options?: Omit<HttpOptions, "method" | "body">) =>
    networkClient<void, TResponse>(endpoint, { ...options, method: "DELETE" });
