import { Hono } from "hono"
import { AttendanceService } from "../services/attendance-service"
import { formatResponse } from "../utils/response-formatter"
import { ApplicationVariables } from "../models/user-model"
import { MutationAttendanceValue, AttendanceQueryParams } from "../validations/attendance-validation"
import { authMiddleware } from "../middlware/auth-middleware"

export const attendanceController = new Hono<{ Variables: ApplicationVariables }>()

attendanceController.use(authMiddleware)

attendanceController.post('/api/attendance/check-in', async (c) => {
    const user = c.get('user')
    const req = await c.req.json() as MutationAttendanceValue
    const attendance = await AttendanceService.checkIn(user, req)
    return c.json(formatResponse(attendance, "Successfully checked in"), 200)
})

attendanceController.post('/api/attendance/check-out', async (c) => {
    const user = c.get('user')
    const attendance = await AttendanceService.checkOut(user)
    return c.json(formatResponse(attendance, "Successfully checked out"), 200)
})

attendanceController.get('/api/attendance/today', async (c) => {
    const user = c.get('user')
    const attendance = await AttendanceService.getTodayAttendance(user)
    return c.json(formatResponse(attendance, "Successfully got today's attendance"), 200)
})

attendanceController.get('/api/attendance/history', async (c) => {
    const user = c.get('user')
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as AttendanceQueryParams
    const result = await AttendanceService.getAttendanceHistory(user, query)
    return c.json(formatResponse(result, "Successfully got attendance history"), 200)
})