import z from "zod";

export const requiredString = z
    .string({ message: 'Required' })
    .min(1, 'Required')

export const modelIdSchema = z.object({
    id: z.string().uuid("Invalid ID format")
})

export type ModelIdValue = z.infer<typeof modelIdSchema>