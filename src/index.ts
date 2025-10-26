import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { userController } from './controllers/user-controller'
import { attendanceController } from './controllers/attendance-controller'
import { leaveController } from './controllers/leave-controller'
import { meetingController } from './controllers/meeting-controller'
import { noticeController } from './controllers/notice-controller'
import { adminController } from './controllers/admin-controller'
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
app.route('/', attendanceController)
app.route('/', leaveController)
app.route('/', meetingController)
app.route('/', noticeController)
app.route('/', adminController)

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
