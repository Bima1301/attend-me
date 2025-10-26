import { Hono } from "hono"
import { formatResponse } from "../utils/response-formatter"
import { MutationNoticeValue, NoticeQueryParams } from "../validations/notice-validation"
import { ApplicationVariables } from "../models/user-model"
import { NoticeService } from "../services/notice-service"
import { authMiddleware } from "../middleware/auth-middleware"

export const noticeController = new Hono<{ Variables: ApplicationVariables }>()

noticeController.use(authMiddleware)

noticeController.post('/api/notices', async (c) => {
    const user = c.get('user')
    const req = await c.req.json() as MutationNoticeValue
    const notice = await NoticeService.createNotice(req)
    return c.json(formatResponse(notice, "Successfully created notice"), 200)
})

noticeController.get('/api/notices', async (c) => {
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as NoticeQueryParams
    const result = await NoticeService.getNotices(query)
    return c.json(formatResponse(result, "Successfully got notices"), 200)
})
