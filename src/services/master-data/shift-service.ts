import { ShiftResponse } from "../../models/master-data/shift-model"
import { MutationShiftValue, Validation } from "../../validations/master-data/shift-validation"
import { PaginatedQuery } from "../../utils/paginated-query"
import { bulkDelete } from "../../utils/bulk-delete"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../../application/database"
import { BaseQueryParams } from "../../utils/query-params"

export class ShiftService {
    static async create(request: MutationShiftValue): Promise<ShiftResponse> {
        const validatedRequest = Validation.SHIFT_MUTATION.parse(request) as MutationShiftValue

        // Check if shift name already exists
        const existingShift = await prismaClient.shift.findFirst({
            where: {
                name: validatedRequest.name,
                isActive: true
            }
        })

        if (existingShift) {
            throw new HTTPException(400, { message: 'Shift name already exists' })
        }

        const shift = await prismaClient.shift.create({
            data: validatedRequest
        })

        return shift
    }

    static async getAll(query: BaseQueryParams): Promise<{ shifts: ShiftResponse[], totalData: number, totalPage: number }> {
        const result = await PaginatedQuery.execute({
            query,
            model: prismaClient.shift,
            validationSchema: Validation.SHIFT_QUERY,
            defaultOrderBy: { createdAt: 'desc' }
        })

        return {
            shifts: result.data,
            totalData: result.totalData,
            totalPage: result.totalPage
        }
    }
    static async getById(id: string): Promise<ShiftResponse> {
        const shift = await prismaClient.shift.findUnique({
            where: { id }
        })

        if (!shift) {
            throw new HTTPException(404, { message: 'Shift not found' })
        }

        return shift
    }

    static async update(id: string, request: MutationShiftValue): Promise<ShiftResponse> {
        const validatedRequest = Validation.SHIFT_MUTATION.parse(request) as MutationShiftValue

        // Check if shift exists
        const existingShift = await prismaClient.shift.findUnique({
            where: { id }
        })

        if (!existingShift) {
            throw new HTTPException(404, { message: 'Shift not found' })
        }

        // Check if new name already exists (if name is being updated)
        if (validatedRequest.name && validatedRequest.name !== existingShift.name) {
            const nameExists = await prismaClient.shift.findFirst({
                where: {
                    name: validatedRequest.name,
                    isActive: true,
                    id: { not: id }
                }
            })

            if (nameExists) {
                throw new HTTPException(400, { message: 'Shift name already exists' })
            }
        }

        const updatedShift = await prismaClient.shift.update({
            where: { id },
            data: validatedRequest
        })

        return {
            id: updatedShift.id,
            name: updatedShift.name,
            clockIn: updatedShift.clockIn,
            clockOut: updatedShift.clockOut,
            isActive: updatedShift.isActive,
            createdAt: updatedShift.createdAt,
            updatedAt: updatedShift.updatedAt
        }
    }

    static async delete(id: string): Promise<void> {
        const existingShift = await prismaClient.shift.findUnique({
            where: { id }
        })

        if (!existingShift) {
            throw new HTTPException(404, { message: 'Shift not found' })
        }

        await prismaClient.shift.delete({
            where: { id }
        })
    }

    static async deleteMany(ids: string[]): Promise<{ deletedCount: number, failedIds: string[], notFoundIds: string[] }> {
        return await bulkDelete(prismaClient.shift, ids)
    }

    static async toggleActive(id: string): Promise<ShiftResponse> {
        const existingShift = await prismaClient.shift.findUnique({
            where: { id }
        })

        if (!existingShift) {
            throw new HTTPException(404, { message: 'Shift not found' })
        }

        const updatedShift = await prismaClient.shift.update({
            where: { id },
            data: { isActive: !existingShift.isActive }
        })

        return {
            id: updatedShift.id,
            name: updatedShift.name,
            clockIn: updatedShift.clockIn,
            clockOut: updatedShift.clockOut,
            isActive: updatedShift.isActive,
            createdAt: updatedShift.createdAt,
            updatedAt: updatedShift.updatedAt
        }
    }
}
