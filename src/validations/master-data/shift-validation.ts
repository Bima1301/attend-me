import z, { ZodType } from "zod"
import { QueryParams } from "../../utils/query-params"
import { requiredString } from "../common"

const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

const mutationShiftSchema = z.object({
    name: requiredString,
    clockIn: z.string()
        .regex(timeFormatRegex, "Clock in must be in HH:MM format (e.g., 08:00)")
        .refine((time) => {
            const [hours, minutes] = time.split(':').map(Number)
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
        }, "Invalid time format"),
    clockOut: z.string()
        .regex(timeFormatRegex, "Clock out must be in HH:MM format (e.g., 17:00)")
        .refine((time) => {
            const [hours, minutes] = time.split(':').map(Number)
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
        }, "Invalid time format"),
    isActive: z.boolean().optional().default(true)
}).refine((data) => {
    const clockInTime = data.clockIn.split(':').map(Number)
    const clockOutTime = data.clockOut.split(':').map(Number)
    const clockInMinutes = clockInTime[0] * 60 + clockInTime[1]
    const clockOutMinutes = clockOutTime[0] * 60 + clockOutTime[1]

    return clockOutMinutes > clockInMinutes
}, {
    message: "Clock out time must be after clock in time",
    path: ["clockOut"]
})


export type MutationShiftValue = z.infer<typeof mutationShiftSchema>

export class Validation {
    static readonly SHIFT_MUTATION: ZodType = mutationShiftSchema
    static readonly SHIFT_QUERY: ZodType = QueryParams.BASE
}
