import { Hono } from "hono"
import { MeetingService } from "../services/meeting-service"
import { formatResponse } from "../utils/response-formatter"
import { MutationMeetingValue, MeetingQueryParams } from "../validations/meeting-validation"
import { ApplicationVariables } from "../models/user-model"
import { authMiddleware } from "../middleware/auth-middleware"

export const meetingController = new Hono<{ Variables: ApplicationVariables }>()

meetingController.use(authMiddleware)

meetingController.post('/api/meetings', async (c) => {
    const user = c.get('user')
    const req = await c.req.json() as MutationMeetingValue
    const meeting = await MeetingService.createMeeting(req)
    return c.json(formatResponse(meeting, "Successfully created meeting"), 200)
})

meetingController.get('/api/meetings', async (c) => {
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as MeetingQueryParams
    const result = await MeetingService.getMeetings(query)
    return c.json(formatResponse(result, "Successfully got meetings"), 200)
})
