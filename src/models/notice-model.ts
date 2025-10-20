import { NoticeType, Priority } from "../generated/prisma"

export interface NoticeResponse {
    id: string
    title: string
    content: string
    type: NoticeType
    priority: Priority
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}
