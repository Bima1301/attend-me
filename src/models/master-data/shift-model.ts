import { Shift } from "../../generated/prisma"

export interface ShiftResponse {
    id: string
    name: string
    clockIn: string
    clockOut: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CreateShiftRequest {
    name: string
    clockIn: string
    clockOut: string
    isActive?: boolean
}

export interface UpdateShiftRequest {
    name?: string
    clockIn?: string
    clockOut?: string
    isActive?: boolean
}
