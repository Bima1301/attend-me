import { BaseQueryParams, QueryParams } from "./query-params"
import { Prisma } from "../generated/prisma"

export interface PaginatedResult<T> {
    data: T[]
    totalData: number
    totalPage: number
}

export interface PaginatedQueryOptions<T> {
    query: BaseQueryParams
    where?: any
    orderBy?: Prisma.Enumerable<any>
    model: any // Prisma model client
    validationSchema?: any
    defaultOrderBy?: any
    transform?: (item: any) => T
    searchMode?: 'AND' | 'OR' // Search mode for multiple column search
}

export class PaginatedQuery {
    /**
     * Generic method to handle paginated queries with filtering, searching, and pagination
     * 
     * @param options Configuration options for the query
     * @returns Paginated result with data, totalData, and totalPage
     * 
     * @example
     * const result = await PaginatedQuery.execute({
     *   query: { page: 1, rows: 10, searchFilters: '{"name":"test"}' },
     *   model: prismaClient.shift,
     *   defaultOrderBy: { createdAt: 'desc' },
     *   validationSchema: Validation.SHIFT_QUERY
     * })
     */
    static async execute<T = any>(options: PaginatedQueryOptions<T>): Promise<PaginatedResult<T>> {
        const {
            query,
            where: additionalWhere = {},
            orderBy,
            model,
            validationSchema,
            defaultOrderBy = { createdAt: 'desc' },
            transform,
            searchMode = 'OR' // Default to OR for multi-column search
        } = options

        // Validate query if schema provided
        const validatedQuery = validationSchema
            ? validationSchema.parse(query)
            : query

        // Parse query parameters
        const filters = QueryParams.parseFilters(validatedQuery.filters)
        const searchFilters = QueryParams.parseSearchFilters(validatedQuery.searchFilters)
        const rangedFilters = QueryParams.parseRangedFilters(validatedQuery.rangedFilters)

        // Build where clause with search mode
        const dynamicWhere = QueryParams.buildWhereClause(filters, searchFilters, rangedFilters, searchMode)
        const where = { ...dynamicWhere, ...additionalWhere }

        // Handle pagination - prefer rows over limit
        const limit = validatedQuery.rows || validatedQuery.limit
        const { skip, take } = QueryParams.buildPagination(validatedQuery.page, limit)

        // Determine orderBy
        const finalOrderBy = orderBy || defaultOrderBy

        // Execute queries in parallel
        const [data, totalData] = await Promise.all([
            model.findMany({
                where,
                skip,
                take,
                orderBy: finalOrderBy
            }),
            model.count({ where })
        ])

        // Calculate total pages
        const totalPage = Math.ceil(totalData / take)

        // Transform data if transform function provided
        const transformedData = transform ? data.map(transform) : data

        return {
            data: transformedData,
            totalData,
            totalPage
        }
    }

    /**
     * Simplified method for basic pagination without complex filtering
     * 
     * @param options Simplified options
     * @returns Paginated result
     */
    static async simple<T = any>(options: {
        query: BaseQueryParams
        model: any
        where?: any
        orderBy?: any
        transform?: (item: any) => T
    }): Promise<PaginatedResult<T>> {
        return this.execute({
            ...options,
            defaultOrderBy: options.orderBy || { createdAt: 'desc' }
        })
    }
}
