import { Hono } from "hono"
import { LeaveService } from "../services/leave-service"
import { formatResponse } from "../utils/response-formatter"
import { MutationLeaveValue, LeaveQueryParams } from "../validations/leave-validation"
import { ApplicationVariables } from "../models/user-model"
import { authMiddleware } from "../middleware/auth-middleware"

export const leaveController = new Hono<{ Variables: ApplicationVariables }>()

leaveController.use(authMiddleware)

leaveController.post('/api/leaves', async (c) => {
    const user = c.get('user')
    const req = await c.req.json() as MutationLeaveValue
    const leave = await LeaveService.createLeave(user, req)
    return c.json(formatResponse(leave, "Successfully created leave request"), 200)
})

leaveController.get('/api/leaves', async (c) => {
    const user = c.get('user')
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as LeaveQueryParams
    const result = await LeaveService.getLeaves(user, query)
    return c.json(formatResponse(result, "Successfully got leaves"), 200)
})

leaveController.patch('/api/leaves/:id', async (c) => {
    const user = c.get('user')
    const leaveId = c.req.param('id')
    const { status } = await c.req.json()

    if (user.role !== 'ADMIN') {
        return c.json(formatResponse(null, "Unauthorized"), 403)
    }

    const leave = await LeaveService.updateLeaveStatus(leaveId, status, user.id)
    return c.json(formatResponse(leave, "Successfully updated leave status"), 200)
})
