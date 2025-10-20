import z, { ZodType } from "zod"
import { BaseQueryParams, QueryParams } from "../utils/query-params"

const mutationNoticeSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    type: z.enum(['GENERAL', 'URGENT', 'HOLIDAY', 'POLICY']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional()
})

export type MutationNoticeValue = z.infer<typeof mutationNoticeSchema>
export type NoticeQueryParams = BaseQueryParams

export class Validation {
    static readonly NOTICE: ZodType = mutationNoticeSchema
    static readonly NOTICE_QUERY: ZodType = QueryParams.BASE
    static readonly TOKEN: ZodType = z.string().min(1)
}
