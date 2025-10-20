import { AttendanceStatus, WorkMode } from "../generated/prisma"

export interface DashboardStats {
    totalEmployees: number
    totalPresent: number
    totalLate: number
    totalLeave: number
    totalAppointments: number
    totalMeetings: number
    totalNotices: number
}

export interface AttendanceReport {
    workingDays: number
    onTime: number
    late: number
    absent: number
    leave: number
    overtime: number
    dailyReport: DailyReport[]
}

export interface DailyReport {
    date: string
    status: AttendanceStatus
    checkIn: Date | null
    checkOut: Date | null
    workMode: WorkMode
}
