import { User, LeaveStatus } from "../generated/prisma"
import { LeaveResponse } from "../models/leave-model"
import { MutationLeaveValue, LeaveQueryParams, Validation } from "../validations/leave-validation"
import { QueryParams } from "../utils/query-params"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../application/database"

export class LeaveService {
    static async createLeave(user: User, request: MutationLeaveValue): Promise<LeaveResponse> {
        const validatedRequest = Validation.LEAVE.parse(request) as MutationLeaveValue

        const startDate = new Date(validatedRequest.startDate)
        const endDate = new Date(validatedRequest.endDate)

        if (startDate >= endDate) {
            throw new HTTPException(400, { message: 'End date must be after start date' })
        }

        const leave = await prismaClient.leave.create({
            data: {
                userId: user.id,
                type: validatedRequest.type,
                startDate,
                endDate,
                reason: validatedRequest.reason
            }
        })

        return {
            id: leave.id,
            userId: leave.userId,
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            approvedBy: leave.approvedBy,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
        }
    }

    static async getLeaves(user: User, query: LeaveQueryParams): Promise<{ leaves: LeaveResponse[], totalData: number, totalPage: number }> {
        const validatedQuery = Validation.LEAVE_QUERY.parse(query) as LeaveQueryParams

        const filters = QueryParams.parseFilters(validatedQuery.filters)
        const searchFilters = QueryParams.parseSearchFilters(validatedQuery.searchFilters)
        const rangedFilters = QueryParams.parseRangedFilters(validatedQuery.rangedFilters)

        const where = QueryParams.buildWhereClause(filters, searchFilters, rangedFilters)
        where.userId = user.id

        const { skip, take } = QueryParams.buildPagination(validatedQuery.page, validatedQuery.limit)

        const [leaves, totalData] = await Promise.all([
            prismaClient.leave.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient.leave.count({ where })
        ])

        const totalPage = Math.ceil(totalData / take)

        return {
            leaves: leaves.map(leave => ({
                id: leave.id,
                userId: leave.userId,
                type: leave.type,
                startDate: leave.startDate,
                endDate: leave.endDate,
                reason: leave.reason,
                status: leave.status,
                approvedBy: leave.approvedBy,
                createdAt: leave.createdAt,
                updatedAt: leave.updatedAt
            })),
            totalData,
            totalPage
        }
    }

    static async updateLeaveStatus(leaveId: string, status: LeaveStatus, approvedBy: string): Promise<LeaveResponse> {
        const leave = await prismaClient.leave.update({
            where: { id: leaveId },
            data: {
                status,
                approvedBy: status === LeaveStatus.APPROVED ? approvedBy : null
            }
        })

        return {
            id: leave.id,
            userId: leave.userId,
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            approvedBy: leave.approvedBy,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
        }
    }
}
