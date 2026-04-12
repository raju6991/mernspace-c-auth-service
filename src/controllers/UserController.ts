import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { Response, NextFunction, Request } from 'express'
import { CreateUserRequest, UpdateUserRequest } from '../types'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        //validation
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string))
        }

        const { firstName, lastName, email, password, tenantId, role } =
            req.body

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            })

            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id as string

        if (Number.isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'))
            return
        }

        try {
            const user = await this.userService.findById(Number(userId))
            if (!user) {
                next(createHttpError(404, 'User not found.'))
                return
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...userWithoutPassword } = user
            res.json(userWithoutPassword)
        } catch (err) {
            next(err)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const queryParams = req.query
            const [users, total] = await this.userService.getAll({
                q: (queryParams.q as string) || '',
                role: (queryParams.role as string) || '',
                perPage: queryParams.perPage ? Number(queryParams.perPage) : 10,
                currentPage: queryParams.currentPage
                    ? Number(queryParams.currentPage)
                    : 1,
            })
            res.json({ users, total })
        } catch (err) {
            next(err)
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        const userId = req.params.id as string

        if (Number.isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'))
            return
        }

        const { firstName, lastName, role, email, tenantId } = req.body

        try {
            const existingUser = await this.userService.findById(Number(userId))
            if (!existingUser) {
                next(createHttpError(404, 'User not found.'))
                return
            }

            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
                email,
                tenantId,
            })

            this.logger.info('User has been updated', { id: userId })
            res.json({ id: Number(userId) })
        } catch (err) {
            next(err)
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id as string

        if (Number.isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'))
            return
        }

        try {
            const existingUser = await this.userService.findById(Number(userId))
            if (!existingUser) {
                next(createHttpError(404, 'User not found.'))
                return
            }

            await this.userService.deleteById(Number(userId))

            this.logger.info('User has been deleted', {
                id: Number(userId),
            })
            res.json({ id: Number(userId) })
        } catch (err) {
            next(err)
        }
    }
}
