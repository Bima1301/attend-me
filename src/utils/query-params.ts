import z, { ZodType } from "zod"

export interface FilterQuery {
    [key: string]: string | string[] | number | number[]
}

export interface SearchFilterQuery {
    [key: string]: string
}

export interface RangedFilter {
    key: string
    start: number | string
    end: number | string
}

export interface PaginationQuery {
    page?: number
    limit?: number
}

export interface BaseQueryParams extends PaginationQuery {
    filters?: string
    searchFilters?: string
    rangedFilters?: string
}

const paginationSchema = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional()
})

const baseQuerySchema = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    filters: z.string().optional(),
    searchFilters: z.string().optional(),
    rangedFilters: z.string().optional()
})

export class QueryParams {
    static readonly PAGINATION: ZodType = paginationSchema
    static readonly BASE: ZodType = baseQuerySchema

    static parseFilters(filtersString?: string): FilterQuery {
        if (!filtersString) return {}
        try {
            return JSON.parse(filtersString) as FilterQuery
        } catch {
            return {}
        }
    }

    static parseSearchFilters(searchFiltersString?: string): SearchFilterQuery {
        if (!searchFiltersString) return {}
        try {
            return JSON.parse(searchFiltersString) as SearchFilterQuery
        } catch {
            return {}
        }
    }

    static parseRangedFilters(rangedFiltersString?: string): RangedFilter[] {
        if (!rangedFiltersString) return []
        try {
            return JSON.parse(rangedFiltersString) as RangedFilter[]
        } catch {
            return []
        }
    }

    static buildWhereClause(
        filters?: FilterQuery,
        searchFilters?: SearchFilterQuery,
        rangedFilters?: RangedFilter[]
    ): any {
        const where: any = {}

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    where[key] = { in: value }
                } else {
                    where[key] = value
                }
            })
        }

        if (searchFilters) {
            Object.entries(searchFilters).forEach(([key, value]) => {
                where[key] = { contains: value, mode: 'insensitive' }
            })
        }

        if (rangedFilters && rangedFilters.length > 0) {
            rangedFilters.forEach(range => {
                where[range.key] = {
                    gte: range.start,
                    lte: range.end
                }
            })
        }

        return where
    }

    static buildPagination(page?: number, limit?: number) {
        const pageNum = page || 1
        const limitNum = limit || 10
        const skip = (pageNum - 1) * limitNum

        return { skip, take: limitNum }
    }
}
