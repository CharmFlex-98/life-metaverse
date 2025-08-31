export const Config = () => {
    return {
        serverDomain: process.env.SERVER_DOMAIN ?? "localhost:8081"
    }
}
