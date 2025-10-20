import { MeetingStatus } from "../generated/prisma"

export interface MeetingResponse {
    id: string
    title: string
    description: string | null
    startTime: Date
    endTime: Date
    location: string | null
    attendees: string[]
    status: MeetingStatus
    createdAt: Date
    updatedAt: Date
}
