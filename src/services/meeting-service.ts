import { User } from "../generated/prisma"
import { MeetingResponse } from "../models/meeting-model"
import { MutationMeetingValue, MeetingQueryParams, Validation } from "../validations/meeting-validation"
import { QueryParams } from "../utils/query-params"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../application/database"

export class MeetingService {
    static async createMeeting(request: MutationMeetingValue): Promise<MeetingResponse> {
        const validatedRequest = Validation.MEETING.parse(request) as MutationMeetingValue

        const startTime = new Date(validatedRequest.startTime)
        const endTime = new Date(validatedRequest.endTime)

        if (startTime >= endTime) {
            throw new HTTPException(400, { message: 'End time must be after start time' })
        }

        const meeting = await prismaClient.meeting.create({
            data: {
                title: validatedRequest.title,
                description: validatedRequest.description,
                startTime,
                endTime,
                location: validatedRequest.location,
                attendees: validatedRequest.attendees || []
            }
        })

        return {
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            location: meeting.location,
            attendees: meeting.attendees,
            status: meeting.status,
            createdAt: meeting.createdAt,
            updatedAt: meeting.updatedAt
        }
    }

    static async getMeetings(query: MeetingQueryParams): Promise<{ meetings: MeetingResponse[], totalData: number, totalPage: number }> {
        const validatedQuery = Validation.MEETING_QUERY.parse(query) as MeetingQueryParams

        const filters = QueryParams.parseFilters(validatedQuery.filters)
        const searchFilters = QueryParams.parseSearchFilters(validatedQuery.searchFilters)
        const rangedFilters = QueryParams.parseRangedFilters(validatedQuery.rangedFilters)

        const where = QueryParams.buildWhereClause(filters, searchFilters, rangedFilters)

        const { skip, take } = QueryParams.buildPagination(validatedQuery.page, validatedQuery.limit)

        const [meetings, totalData] = await Promise.all([
            prismaClient.meeting.findMany({
                where,
                skip,
                take,
                orderBy: { startTime: 'asc' }
            }),
            prismaClient.meeting.count({ where })
        ])

        const totalPage = Math.ceil(totalData / take)

        return {
            meetings: meetings.map(meeting => ({
                id: meeting.id,
                title: meeting.title,
                description: meeting.description,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                location: meeting.location,
                attendees: meeting.attendees,
                status: meeting.status,
                createdAt: meeting.createdAt,
                updatedAt: meeting.updatedAt
            })),
            totalData,
            totalPage
        }
    }
}
