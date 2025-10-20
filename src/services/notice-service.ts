import { User, NoticeType } from "../generated/prisma"
import { NoticeResponse } from "../models/notice-model"
import { MutationNoticeValue, NoticeQueryParams, Validation } from "../validations/notice-validation"
import { QueryParams } from "../utils/query-params"
import { HTTPException } from "hono/http-exception"
import { prismaClient } from "../application/database"

export class NoticeService {
    static async createNotice(request: MutationNoticeValue): Promise<NoticeResponse> {
        const validatedRequest = Validation.NOTICE.parse(request) as MutationNoticeValue

        const notice = await prismaClient.notice.create({
            data: {
                title: validatedRequest.title,
                content: validatedRequest.content,
                type: validatedRequest.type || NoticeType.GENERAL,
                priority: validatedRequest.priority || 'NORMAL'
            }
        })

        return {
            id: notice.id,
            title: notice.title,
            content: notice.content,
            type: notice.type,
            priority: notice.priority,
            isActive: notice.isActive,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt
        }
    }

    static async getNotices(query: NoticeQueryParams): Promise<{ notices: NoticeResponse[], totalData: number, totalPage: number }> {
        const validatedQuery = Validation.NOTICE_QUERY.parse(query) as NoticeQueryParams

        const filters = QueryParams.parseFilters(validatedQuery.filters)
        const searchFilters = QueryParams.parseSearchFilters(validatedQuery.searchFilters)
        const rangedFilters = QueryParams.parseRangedFilters(validatedQuery.rangedFilters)

        const where = QueryParams.buildWhereClause(filters, searchFilters, rangedFilters)
        where.isActive = true

        const { skip, take } = QueryParams.buildPagination(validatedQuery.page, validatedQuery.limit)

        const [notices, totalData] = await Promise.all([
            prismaClient.notice.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient.notice.count({ where })
        ])

        const totalPage = Math.ceil(totalData / take)

        return {
            notices: notices.map(notice => ({
                id: notice.id,
                title: notice.title,
                content: notice.content,
                type: notice.type,
                priority: notice.priority,
                isActive: notice.isActive,
                createdAt: notice.createdAt,
                updatedAt: notice.updatedAt
            })),
            totalData,
            totalPage
        }
    }
}
