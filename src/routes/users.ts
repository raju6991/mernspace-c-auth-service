import express, { NextFunction, Request, Response } from 'express'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import userValidator from '../validator/user-validator'
import listUserValidator from '../validator/list-user-validator'
import updateUserValidator from '../validator/update-user-validator'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger)

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    userValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
)

router.get(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getById(req, res, next),
)

router.get(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
)

router.put(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
)

router.delete(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next),
)

export default router
