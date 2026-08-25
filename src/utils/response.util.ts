import type { Response } from 'express'

interface SuccessOptions<T> {
  message: string
  data?: T
  statusCode?: number
}

interface ErrorOptions {
  message: string
  statusCode?: number
  errors?: unknown
}

function sendSuccess<T>(
  res: Response,
  { message, data, statusCode = 200 }: SuccessOptions<T>,
) {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  })
}

function sendError(
  res: Response,
  { message, statusCode = 400, errors }: ErrorOptions,
) {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  })
}

export { sendSuccess, sendError }
