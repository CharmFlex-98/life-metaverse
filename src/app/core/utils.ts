export const calculateCanvasSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return { width, height };
}

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type Prettier<T> = {
    [K in keyof T]: T[K]
} & {}