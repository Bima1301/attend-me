import z, { ZodType } from "zod"
import { BaseQueryParams, QueryParams } from "../utils/query-params"

const mutationMeetingSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional()
})

export type MutationMeetingValue = z.infer<typeof mutationMeetingSchema>
export type MeetingQueryParams = BaseQueryParams

export class Validation {
    static readonly MEETING: ZodType = mutationMeetingSchema
    static readonly MEETING_QUERY: ZodType = QueryParams.BASE
    static readonly TOKEN: ZodType = z.string().min(1)
}
