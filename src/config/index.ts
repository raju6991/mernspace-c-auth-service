import { config } from 'dotenv'
import path from 'node:path'

config({
    path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`),
})

const getEnv = (key: string): string | undefined => {
    return process.env[key]
}

export const Config = {
    get PORT() {
        return getEnv('PORT')
    },
    get NODE_ENV() {
        return getEnv('NODE_ENV')
    },
    get DB_HOST() {
        return getEnv('DB_HOST')
    },
    get DB_PORT() {
        return getEnv('DB_PORT')
    },
    get DB_USERNAME() {
        return getEnv('DB_USERNAME')
    },
    get DB_PASSWORD() {
        return getEnv('DB_PASSWORD')
    },
    get DB_NAME() {
        return getEnv('DB_NAME')
    },
    get REFRESH_TOKEN_SECRET() {
        return getEnv('REFRESH_TOKEN_SECRET')
    },
    get JWKS_URI() {
        return getEnv('JWKS_URI')
    },
    get PRIVATE_KEY() {
        return getEnv('PRIVATE_KEY')
    },
}
