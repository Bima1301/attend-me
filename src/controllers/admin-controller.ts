import { Hono } from "hono"
import { AdminService } from "../services/admin-service"
import { formatResponse } from "../utils/response-formatter"
import { ApplicationVariables } from "../models/user-model"
import { authMiddleware } from "../middleware/auth-middleware"

export const adminController = new Hono<{ Variables: ApplicationVariables }>()

adminController.use(authMiddleware)

adminController.use(async (c, next) => {
    const user = c.get('user')

    if (user.role !== 'ADMIN') {
        return c.json(formatResponse(null, "Unauthorized"), 403)
    }

    await next()
})

adminController.get('/api/admin/dashboard', async (c) => {
    const stats = await AdminService.getDashboardStats()
    return c.json(formatResponse(stats, "Successfully got dashboard stats"), 200)
})

adminController.get('/api/admin/reports/:userId', async (c) => {
    const userId = c.req.param('userId')
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || ''))
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = query.endDate ? new Date(query.endDate) : new Date()

    const report = await AdminService.getAttendanceReport(userId, startDate, endDate)
    return c.json(formatResponse(report, "Successfully got attendance report"), 200)
})
