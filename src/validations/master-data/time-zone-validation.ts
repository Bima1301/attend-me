import z, { ZodType } from "zod";
import { requiredString } from "../common";
import { QueryParams } from "../../utils/query-params";

const mutationTimeZoneSchema = z.object({
    name: requiredString,
    nameCode: requiredString,
    timeCode: requiredString,
    timezone: requiredString,
})

export type MutationTimeZoneValue = z.infer<typeof mutationTimeZoneSchema>

export class Validation {
    static readonly TIME_ZONE_MUTATION: ZodType = mutationTimeZoneSchema
    static readonly TIME_ZONE_QUERY: ZodType = QueryParams.BASE
}