import z, { ZodType } from "zod"
import { BaseQueryParams, QueryParams } from "../utils/query-params"

const mutationUserSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional()
})

const mutationLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
})

const mutationUpdateUserSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    password: z.string().min(8).optional(),
})

export type MutationUserValue = z.infer<typeof mutationUserSchema>
export type MutationLoginValue = z.infer<typeof mutationLoginSchema>
export type MutationUpdateUserValue = z.infer<typeof mutationUpdateUserSchema>
export type UserQueryParams = BaseQueryParams

export class Validation {
    static readonly USER_REGISTER: ZodType = mutationUserSchema
    static readonly USER_LOGIN: ZodType = mutationLoginSchema
    static readonly USER_UPDATE: ZodType = mutationUpdateUserSchema
    static readonly USER_QUERY: ZodType = QueryParams.BASE
    static readonly TOKEN: ZodType = z.string().min(1)
}