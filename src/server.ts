import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'
import { User } from './entity/User'
import bcrypt from 'bcryptjs'
import { Roles } from './constants'

const createAdminUser = async () => {
    const userRepository = AppDataSource.getRepository(User)

    const adminExists = await userRepository.findOne({
        where: { role: Roles.ADMIN },
    })

    if (!adminExists) {
        const hashedPassword = await bcrypt.hash(
            Config.ADMIN_PASSWORD || 'admin',
            10,
        )
        await userRepository.save({
            firstName: Config.ADMIN_FIRST_NAME || 'Admin',
            lastName: Config.ADMIN_LAST_NAME || 'Admin',
            email: Config.ADMIN_EMAIL || 'admin@example.com',
            password: hashedPassword,
            role: Roles.ADMIN,
        })
        logger.info('Admin user created successfully.')
    }
}

const startServer = async () => {
    const PORT = Number(Config.PORT) || 5501
    try {
        await AppDataSource.initialize()
        logger.info('Database connected successfully.')
        await createAdminUser()
        app.listen(PORT, () => {
            logger.info('Server Listening on Port', { port: PORT })
        })
    } catch (err) {
        logger.error(err)
        process.exit(1)
    }
}

// invoke function
startServer()
