import { checkSchema } from 'express-validator'

export default checkSchema({
    firstName: {
        trim: true,
        errorMessage: 'First name is required',
        notEmpty: true,
    },
    lastName: {
        trim: true,
        errorMessage: 'Last name is required',
        notEmpty: true,
    },
    email: {
        trim: true,
        errorMessage: 'Email is required',
        notEmpty: true,
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    password: {
        trim: true,
        errorMessage: 'Password is required',
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password length should be at least 8 chars',
        },
    },
    role: {
        trim: true,
        errorMessage: 'Role is required',
        notEmpty: true,
        isIn: {
            options: [['admin', 'manager', 'customer']],
            errorMessage: 'Role should be one of: admin, manager, customer',
        },
    },
    tenantId: {
        trim: true,
        errorMessage: 'Tenant ID is required',
        notEmpty: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'Tenant ID should be a positive integer',
        },
    },
})
