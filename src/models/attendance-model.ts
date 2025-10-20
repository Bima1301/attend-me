import { WorkMode, AttendanceStatus } from "../generated/prisma"

export interface AttendanceResponse {
    id: string
    userId: string
    checkIn: Date | null
    checkOut: Date | null
    workMode: WorkMode
    status: AttendanceStatus
    notes: string | null
    createdAt: Date
    updatedAt: Date
}
