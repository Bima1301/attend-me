import z, { ZodType } from "zod"
import { BaseQueryParams, QueryParams } from "../utils/query-params"

const mutationLeaveSchema = z.object({
    type: z.enum(['SICK', 'VACATION', 'PERSONAL', 'EMERGENCY']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string().min(1).max(500)
})

export type MutationLeaveValue = z.infer<typeof mutationLeaveSchema>
export type LeaveQueryParams = BaseQueryParams

export class Validation {
    static readonly LEAVE: ZodType = mutationLeaveSchema
    static readonly LEAVE_QUERY: ZodType = QueryParams.BASE
    static readonly TOKEN: ZodType = z.string().min(1)
}
