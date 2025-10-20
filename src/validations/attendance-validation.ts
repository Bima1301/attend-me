import z, { ZodType } from "zod"
import { BaseQueryParams, QueryParams } from "../utils/query-params"

const mutationAttendanceSchema = z.object({
    workMode: z.enum(['OFFICE', 'HOME']).optional(),
    notes: z.string().optional()
})

export type MutationAttendanceValue = z.infer<typeof mutationAttendanceSchema>
export type AttendanceQueryParams = BaseQueryParams

export class Validation {
    static readonly ATTENDANCE: ZodType = mutationAttendanceSchema
    static readonly ATTENDANCE_QUERY: ZodType = QueryParams.BASE
    static readonly TOKEN: ZodType = z.string().min(1)
}
