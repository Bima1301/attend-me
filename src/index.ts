import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { userController } from './controllers/user-controller'
import { shiftController } from './controllers/master-data/shift-controller'
import { formatErrorResponse } from './utils/response-formatter'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors({
  origin: '*',
  exposeHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => {
  return c.text('Attendance API - Hello Hono!')
})

app.route('/api/users', userController)
app.route('/api/master-data/shifts', shiftController)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      formatErrorResponse(err.message),
      err.status
    )
  }

  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
    return c.json(
      formatErrorResponse('Validation failed', errorMessages),
      400
    )
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred'
  return c.json(
    formatErrorResponse(message),
    500
  )
})

export default {
  port: 8080,
  fetch: app.fetch
}
