import { User, Role, AttendanceStatus, LeaveStatus, MeetingStatus } from "../generated/prisma"
import { DashboardStats, AttendanceReport, DailyReport } from "../models/admin-model"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../application/database"

export class AdminService {
    static async getDashboardStats(): Promise<DashboardStats> {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [
            totalEmployees,
            totalPresent,
            totalLate,
            totalLeave,
            totalAppointments,
            totalMeetings,
            totalNotices
        ] = await Promise.all([
            prismaClient.user.count({ where: { role: Role.EMPLOYEE } }),
            prismaClient.attendance.count({
                where: {
                    createdAt: { gte: today },
                    status: AttendanceStatus.PRESENT
                }
            }),
            prismaClient.attendance.count({
                where: {
                    createdAt: { gte: today },
                    status: AttendanceStatus.LATE
                }
            }),
            prismaClient.leave.count({
                where: {
                    status: LeaveStatus.APPROVED,
                    startDate: { lte: today },
                    endDate: { gte: today }
                }
            }),
            prismaClient.meeting.count({
                where: {
                    startTime: { gte: today },
                    status: MeetingStatus.SCHEDULED
                }
            }),
            prismaClient.meeting.count({
                where: {
                    startTime: { gte: today },
                    status: MeetingStatus.SCHEDULED
                }
            }),
            prismaClient.notice.count({
                where: {
                    isActive: true,
                    createdAt: { gte: today }
                }
            })
        ])

        return {
            totalEmployees,
            totalPresent,
            totalLate,
            totalLeave,
            totalAppointments,
            totalMeetings,
            totalNotices
        }
    }

    static async getAttendanceReport(userId: string, startDate: Date, endDate: Date): Promise<AttendanceReport> {
        const attendances = await prismaClient.attendance.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        const workingDays = attendances.length
        const onTime = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length
        const late = attendances.filter(a => a.status === AttendanceStatus.LATE).length
        const absent = 0
        const leave = 0
        const overtime = 0

        const dailyReport: DailyReport[] = attendances.map(attendance => ({
            date: attendance.createdAt.toISOString().split('T')[0],
            status: attendance.status,
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            workMode: attendance.workMode
        }))

        return {
            workingDays,
            onTime,
            late,
            absent,
            leave,
            overtime,
            dailyReport
        }
    }
}
