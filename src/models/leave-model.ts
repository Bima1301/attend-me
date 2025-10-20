import { LeaveType, LeaveStatus } from "../generated/prisma"

export interface LeaveResponse {
    id: string
    userId: string
    type: LeaveType
    startDate: Date
    endDate: Date
    reason: string
    status: LeaveStatus
    approvedBy: string | null
    createdAt: Date
    updatedAt: Date
}
