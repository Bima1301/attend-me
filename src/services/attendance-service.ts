import { User, WorkMode, AttendanceStatus } from "../generated/prisma"
import { AttendanceResponse } from "../models/attendance-model"
import { MutationAttendanceValue, AttendanceQueryParams, Validation } from "../validations/attendance-validation"
import { PaginatedQuery } from "../utils/paginated-query"
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
        const result = await PaginatedQuery.execute({
            query,
            model: prismaClient.attendance,
            validationSchema: Validation.ATTENDANCE_QUERY,
            defaultOrderBy: { createdAt: 'desc' },
            where: { userId: user.id },
            transform: (attendance) => ({
                id: attendance.id,
                userId: attendance.userId,
                checkIn: attendance.checkIn,
                checkOut: attendance.checkOut,
                workMode: attendance.workMode,
                status: attendance.status,
                notes: attendance.notes,
                createdAt: attendance.createdAt,
                updatedAt: attendance.updatedAt
            })
        })

        return {
            attendances: result.data,
            totalData: result.totalData,
            totalPage: result.totalPage
        }
    }
}