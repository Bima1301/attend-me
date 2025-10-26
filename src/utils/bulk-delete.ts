/**
 * Generic bulk delete utility
 * Can be used across all services for handling multiple deletion
 */

export interface BulkDeleteResult {
    deletedCount: number
    failedIds: string[]
    notFoundIds: string[]
}

/**
 * Execute bulk delete operations
 * @param model - Prisma model client
 * @param ids - Array of IDs to delete
 * @returns Result with deleted count, failed IDs, and not found IDs
 */
export async function bulkDelete(
    model: any,
    ids: string[]
): Promise<BulkDeleteResult> {
    const failedIds: string[] = []
    const notFoundIds: string[] = []
    let deletedCount = 0

    for (const id of ids) {
        try {
            // Check if record exists
            const existingRecord = await model.findUnique({
                where: { id }
            })

            if (existingRecord) {
                // Delete the record
                await model.delete({
                    where: { id }
                })
                deletedCount++
            } else {
                // Record not found
                notFoundIds.push(id)
            }
        } catch (error) {
            // Failed to delete (might be due to foreign key constraints, etc.)
            failedIds.push(id)
        }
    }

    return {
        deletedCount,
        failedIds,
        notFoundIds
    }
}
