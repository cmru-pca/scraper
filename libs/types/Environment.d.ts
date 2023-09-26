export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FACEBOOK_COOKIES: string
        }
    }
}