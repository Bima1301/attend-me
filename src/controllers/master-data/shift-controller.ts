import { Hono } from "hono"
import { ShiftService } from "../../services/master-data/shift-service"
import { formatResponse, formatListResponse } from "../../utils/response-formatter"
import { MutationShiftValue } from "../../validations/master-data/shift-validation"
import { authMiddleware } from "../../middleware/auth-middleware"
import { ApplicationVariables } from "../../models/user-model"
import { BaseQueryParams } from "../../utils/query-params"
import { modelIdSchema } from "../../validations/common"

export const shiftController = new Hono<{ Variables: ApplicationVariables }>()

shiftController.use(authMiddleware)

shiftController.post('/', async (c) => {
    const req = await c.req.json() as MutationShiftValue
    const shift = await ShiftService.create(req)
    return c.json(formatResponse(shift, "Successfully created shift"), 201)
})

shiftController.get('/', async (c) => {
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as BaseQueryParams
    const result = await ShiftService.getAll(query)
    return c.json(formatListResponse(result.shifts, result.totalData, result.totalPage, "Successfully retrieved shifts"), 200)
})

shiftController.get('/:id', async (c) => {
    const { id } = c.req.param() as { id: string }

    const validatedId = modelIdSchema.parse({ id })

    const shift = await ShiftService.getById(validatedId.id)
    return c.json(formatResponse(shift, "Successfully retrieved shift"), 200)
})

shiftController.patch('/:id', async (c) => {
    const { id } = c.req.param() as { id: string }
    const req = await c.req.json() as MutationShiftValue

    const validatedId = modelIdSchema.parse({ id })

    const shift = await ShiftService.update(validatedId.id, req)
    return c.json(formatResponse(shift, "Successfully updated shift"), 200)
})

shiftController.patch('/:id/toggle', async (c) => {
    const { id } = c.req.param() as { id: string }

    const validatedId = modelIdSchema.parse({ id })

    const shift = await ShiftService.toggleActive(validatedId.id)
    return c.json(formatResponse(shift, "Successfully toggled shift status"), 200)
})

shiftController.delete('/:id', async (c) => {
    const { id } = c.req.param() as { id: string }

    const validatedId = modelIdSchema.parse({ id })

    await ShiftService.delete(validatedId.id)
    return c.json(formatResponse(null, "Successfully deleted shift"), 200)
})

// Bulk delete - handle multiple IDs
shiftController.delete('/', async (c) => {
    const query = Object.fromEntries(new URLSearchParams(c.req.url.split('?')[1] || '')) as any
    const idsParam = query.ids

    if (!idsParam) {
        return c.json(formatResponse(null, "IDs parameter is required for bulk delete", ["IDs parameter is required"]), 400)
    }

    let ids: string[]
    try {
        ids = JSON.parse(idsParam)
    } catch {
        return c.json(formatResponse(null, "Invalid IDs format", ["IDs must be a valid JSON array"]), 400)
    }

    if (!Array.isArray(ids) || ids.length === 0) {
        return c.json(formatResponse(null, "IDs must be a non-empty array", ["IDs must be a non-empty array"]), 400)
    }

    const result = await ShiftService.deleteMany(ids)
    return c.json(formatResponse(result, "Successfully deleted shifts"), 200)
})
