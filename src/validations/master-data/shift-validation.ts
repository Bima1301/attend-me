import { z, ZodType } from "zod"
import { BaseQueryParams, QueryParams } from "../../utils/query-params"

// Time format validation (HH:MM)
const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

export const CreateShiftSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
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
    // Validate that clockOut is after clockIn
    const clockInTime = data.clockIn.split(':').map(Number)
    const clockOutTime = data.clockOut.split(':').map(Number)
    const clockInMinutes = clockInTime[0] * 60 + clockInTime[1]
    const clockOutMinutes = clockOutTime[0] * 60 + clockOutTime[1]

    return clockOutMinutes > clockInMinutes
}, {
    message: "Clock out time must be after clock in time",
    path: ["clockOut"]
})

export const UpdateShiftSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .optional(),
    clockIn: z.string()
        .regex(timeFormatRegex, "Clock in must be in HH:MM format (e.g., 08:00)")
        .refine((time) => {
            const [hours, minutes] = time.split(':').map(Number)
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
        }, "Invalid time format")
        .optional(),
    clockOut: z.string()
        .regex(timeFormatRegex, "Clock out must be in HH:MM format (e.g., 17:00)")
        .refine((time) => {
            const [hours, minutes] = time.split(':').map(Number)
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
        }, "Invalid time format")
        .optional(),
    isActive: z.boolean().optional()
}).refine((data) => {
    // Only validate time order if both clockIn and clockOut are provided
    if (data.clockIn && data.clockOut) {
        const clockInTime = data.clockIn.split(':').map(Number)
        const clockOutTime = data.clockOut.split(':').map(Number)
        const clockInMinutes = clockInTime[0] * 60 + clockInTime[1]
        const clockOutMinutes = clockOutTime[0] * 60 + clockOutTime[1]

        return clockOutMinutes > clockInMinutes
    }
    return true
}, {
    message: "Clock out time must be after clock in time",
    path: ["clockOut"]
})

export const ShiftIdSchema = z.object({
    id: z.string().uuid("Invalid shift ID format")
})

export type CreateShiftValue = z.infer<typeof CreateShiftSchema>
export type UpdateShiftValue = z.infer<typeof UpdateShiftSchema>
export type ShiftIdValue = z.infer<typeof ShiftIdSchema>
export type ShiftQueryParams = BaseQueryParams

export const Validation = {
    CREATE_SHIFT: CreateShiftSchema,
    UPDATE_SHIFT: UpdateShiftSchema,
    SHIFT_ID: ShiftIdSchema,
    SHIFT_QUERY: QueryParams.BASE
}
