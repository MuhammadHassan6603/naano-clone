import type { ErrorRequestHandler, RequestHandler } from 'express'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export const badRequest = (message: string) => new HttpError(400, message)
export const unauthorized = (message = 'Not logged in') => new HttpError(401, message)
export const forbidden = (message = 'Not allowed') => new HttpError(403, message)
export const notFound = (message = 'Not found') => new HttpError(404, message)
export const conflict = (message: string) => new HttpError(409, message)

export const unknownRoute: RequestHandler = (req) => {
  throw notFound(`No route for ${req.method} ${req.path}`)
}

// body-parser marks its own client errors (bad JSON, body too large) with a 4xx status and expose=true.
type ClientError = { status: number; expose: true; type?: string }
const isClientError = (err: unknown): err is ClientError =>
  typeof err === 'object' &&
  err !== null &&
  (err as ClientError).expose === true &&
  (err as ClientError).status >= 400 &&
  (err as ClientError).status < 500

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  if (isClientError(err)) {
    const message = err.type === 'entity.parse.failed' ? 'Request body is not valid JSON' : 'Bad request'
    res.status(err.status).json({ error: message })
    return
  }
  console.error(`${req.method} ${req.originalUrl} failed:`, err)
  res.status(500).json({ error: 'Something went wrong' })
}
