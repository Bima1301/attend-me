import { Hono } from "hono"
import { ApplicationVariables } from "../../models/user-model"
import { authMiddleware } from "../../middleware/auth-middleware"
import { MutationTimeZoneValue } from "../../validations/master-data/time-zone-validation"
import { TimeZoneService } from "../../services/master-data/time-zone"
import { formatListResponse, formatResponse } from "../../utils/response-formatter"
import { BaseQueryParams } from "../../utils/query-params"
import { modelIdSchema } from "../../validations/common"

export const timeZoneController = new Hono<{ Variables: ApplicationVariables }>()

timeZoneController.use(authMiddleware)

timeZoneController.post('/', async (c) => {
    const req = await c.req.json() as MutationTimeZoneValue
    const shift = await TimeZoneService.create(req)
    return c.json(formatResponse(shift, "Successfully created time zone"), 201)
})

timeZoneController.get('/', async (c) => {
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as BaseQueryParams
    const result = await TimeZoneService.getAll(query)
    return c.json(formatListResponse(result.timeZones, result.totalData, result.totalPage, "Successfully retrieved time zones"), 200)
})

timeZoneController.get('/:id', async (c) => {
    const { id } = c.req.param() as { id: string }
    const validatedId = modelIdSchema.parse({ id })
    const timeZone = await TimeZoneService.getById(validatedId.id)
    return c.json(formatResponse(timeZone, "Successfully retrieved time zone"), 200)
})