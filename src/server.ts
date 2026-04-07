import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'

const startServer = async () => {
    const PORT = Number(Config.PORT) || 5501
    try {
        await AppDataSource.initialize()
        logger.info('Database connected successfully.')
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
