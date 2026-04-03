import app from './app'
import { Config } from './config'
import logger from './config/logger'

const startServer = () => {
    const PORT = Number(Config.PORT) || 5501
    try {
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
