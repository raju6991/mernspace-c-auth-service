import { checkSchema } from 'express-validator'

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : ''
                },
            },
        },
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value)
                    return Number(parsedValue) || 1
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value)
                    return Number(parsedValue) || 6
                },
            },
        },
    },
    ['query'],
)
