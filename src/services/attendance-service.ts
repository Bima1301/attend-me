import { User, WorkMode, AttendanceStatus } from "../generated/prisma"
import { AttendanceResponse } from "../models/attendance-model"
import { MutationAttendanceValue, AttendanceQueryParams, Validation } from "../validations/attendance-validation"
import { QueryParams } from "../utils/query-params"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../application/database"

export class AttendanceService {
    static async checkIn(user: User, request: MutationAttendanceValue): Promise<AttendanceResponse> {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const existingAttendance = await prismaClient.attendance.findFirst({
            where: {
                userId: user.id,
                createdAt: {
                    gte: today
                }
            }
        })

        if (existingAttendance) {
            throw new HTTPException(400, { message: 'Already checked in today' })
        }

        const validatedRequest = Validation.ATTENDANCE.parse(request) as MutationAttendanceValue
        const now = new Date()
        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)

        const attendance = await prismaClient.attendance.create({
            data: {
                userId: user.id,
                checkIn: now,
                workMode: validatedRequest.workMode || WorkMode.OFFICE,
                status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
                notes: validatedRequest.notes
            }
        })

        return {
            id: attendance.id,
            userId: attendance.userId,
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            workMode: attendance.workMode,
            status: attendance.status,
            notes: attendance.notes,
            createdAt: attendance.createdAt,
            updatedAt: attendance.updatedAt
        }
    }

    static async checkOut(user: User): Promise<AttendanceResponse> {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const attendance = await prismaClient.attendance.findFirst({
            where: {
                userId: user.id,
                createdAt: {
                    gte: today
                },
                checkOut: null
            }
        })

        if (!attendance) {
            throw new HTTPException(400, { message: 'No check-in found for today' })
        }

        const updatedAttendance = await prismaClient.attendance.update({
            where: { id: attendance.id },
            data: { checkOut: new Date() }
        })

        return {
            id: updatedAttendance.id,
            userId: updatedAttendance.userId,
            checkIn: updatedAttendance.checkIn,
            checkOut: updatedAttendance.checkOut,
            workMode: updatedAttendance.workMode,
            status: updatedAttendance.status,
            notes: updatedAttendance.notes,
            createdAt: updatedAttendance.createdAt,
            updatedAt: updatedAttendance.updatedAt
        }
    }

    static async getTodayAttendance(user: User): Promise<AttendanceResponse | null> {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const attendance = await prismaClient.attendance.findFirst({
            where: {
                userId: user.id,
                createdAt: {
                    gte: today
                }
            }
        })

        if (!attendance) return null

        return {
            id: attendance.id,
            userId: attendance.userId,
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            workMode: attendance.workMode,
            status: attendance.status,
            notes: attendance.notes,
            createdAt: attendance.createdAt,
            updatedAt: attendance.updatedAt
        }
    }

    static async getAttendanceHistory(user: User, query: AttendanceQueryParams): Promise<{ attendances: AttendanceResponse[], totalData: number, totalPage: number }> {
        const validatedQuery = Validation.ATTENDANCE_QUERY.parse(query) as AttendanceQueryParams

        const filters = QueryParams.parseFilters(validatedQuery.filters)
        const searchFilters = QueryParams.parseSearchFilters(validatedQuery.searchFilters)
        const rangedFilters = QueryParams.parseRangedFilters(validatedQuery.rangedFilters)

        const where = QueryParams.buildWhereClause(filters, searchFilters, rangedFilters)
        where.userId = user.id

        const { skip, take } = QueryParams.buildPagination(validatedQuery.page, validatedQuery.limit)

        const [attendances, totalData] = await Promise.all([
            prismaClient.attendance.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient.attendance.count({ where })
        ])

        const totalPage = Math.ceil(totalData / take)

        return {
            attendances: attendances.map(attendance => ({
                id: attendance.id,
                userId: attendance.userId,
                checkIn: attendance.checkIn,
                checkOut: attendance.checkOut,
                workMode: attendance.workMode,
                status: attendance.status,
                notes: attendance.notes,
                createdAt: attendance.createdAt,
                updatedAt: attendance.updatedAt
            })),
            totalData,
            totalPage
        }
    }
}