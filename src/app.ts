import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'
import userRouter from './routes/users'
import path from 'path'

const app = express()
app.use(express.static(path.join(__dirname, '../../public')))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Welcome to auth service')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

app.use(
    '/.well-known',
    express.static(path.join(process.cwd(), 'public/.well-known')),
)
//. global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })
})
export default app
