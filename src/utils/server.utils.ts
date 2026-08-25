import { Application } from 'express'
import { connectToDB } from '../config/db.config.js'
import { logger, serverLogger } from '../middlewares/logger.middleware.js'

const startServer = async (app: Application) => {
  try {
    await connectToDB()

    const PORT = Number(process.env.PORT) || 3000

    app.listen(PORT, () => {
      serverLogger(PORT)
    })
  } catch (error) {
    logger.error('Failed to start server:')
    logger.error(`${error}`)
    process.exit(1)
  }
}

export { startServer }
