import { HTTPException } from "hono/http-exception";
import { prismaClient } from "../../application/database";
import { TimeZoneResponse } from "../../models/master-data/time-zone-model";
import { PaginatedQuery } from "../../utils/paginated-query";
import { BaseQueryParams } from "../../utils/query-params";
import { MutationTimeZoneValue, Validation } from "../../validations/master-data/time-zone-validation";
import { bulkDelete } from "../../utils/bulk-delete";

export class TimeZoneService {
    static async create(request: MutationTimeZoneValue): Promise<TimeZoneResponse> {
        const validationReq = Validation.TIME_ZONE_MUTATION.parse(request) as MutationTimeZoneValue

        const timezone = await prismaClient.timeZone.create({
            data: validationReq
        })

        return timezone
    }

    static async getAll(query: BaseQueryParams): Promise<{ timeZones: TimeZoneResponse[], totalData: number, totalPage: number }> {
        const result = await PaginatedQuery.execute({
            query,
            model: prismaClient.shift,
            validationSchema: Validation.TIME_ZONE_QUERY,
            defaultOrderBy: { createdAt: 'desc' }
        })

        return {
            timeZones: result.data,
            totalData: result.totalData,
            totalPage: result.totalPage
        }
    }

    static async getById(id: string): Promise<TimeZoneResponse> {
        const timeZone = await prismaClient.timeZone.findUnique({
            where: { id }
        })

        if (!timeZone) {
            throw new HTTPException(404, { message: 'Time Zone not found' })
        }

        return timeZone
    }

    static async update(id: string, request: MutationTimeZoneValue): Promise<TimeZoneResponse> {
        const validationReq = Validation.TIME_ZONE_MUTATION.parse(request) as MutationTimeZoneValue

        const timeZone = await prismaClient.timeZone.update({
            where: { id },
            data: validationReq
        })

        return timeZone
    }

    static async deleteMany(ids: string[]): Promise<{ deletedCount: number, failedIds: string[], notFoundIds: string[] }> {
        return await bulkDelete(prismaClient.timeZone, ids)
    }

}