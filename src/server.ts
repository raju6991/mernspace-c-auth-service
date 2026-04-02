import app from './app'
import { Config } from './config'

const startServer = () => {
    const PORT = Config.PORT
    try {
        app.listen(PORT, () => console.log(`Listening on Port ${PORT}`))
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

// invoke function
startServer()
