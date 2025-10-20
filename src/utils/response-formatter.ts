/**
 * Standard API Response Structure
 */

// Response untuk data tunggal (get by id, create, update, delete)
export interface ApiResponse<T> {
    content: T | null;
    message: string;
    errors: string[];
}

// Response untuk data list/paginated (get all)
export interface ApiListResponse<T> {
    content: {
        entries: T[];
        totalData: number;
        totalPage: number;
    };
    message: string;
    errors: string[];
}

/**
 * Format response untuk data tunggal
 * @param content - Data yang akan dikembalikan
 * @param message - Pesan custom (default: "Success")
 * @param errors - Array error messages (default: [])
 */
export function formatResponse<T>(
    content: T | null,
    message: string = "Success",
    errors: string[] = []
): ApiResponse<T> {
    return {
        content,
        message,
        errors
    };
}

/**
 * Format response untuk data list/paginated
 * @param entries - Array data yang akan dikembalikan
 * @param totalData - Total keseluruhan data
 * @param totalPage - Total halaman
 * @param message - Pesan custom (default: "Successfully fetched all data!")
 * @param errors - Array error messages (default: [])
 */
export function formatListResponse<T>(
    entries: T[],
    totalData: number,
    totalPage: number,
    message: string = "Successfully fetched all data!",
    errors: string[] = []
): ApiListResponse<T> {
    return {
        content: {
            entries,
            totalData,
            totalPage
        },
        message,
        errors
    };
}

/**
 * Format error response
 * @param message - Error message
 * @param errors - Array of detailed error messages
 */
export function formatErrorResponse(
    message: string,
    errors: string[] = []
): ApiResponse<null> {
    return {
        content: null,
        message,
        errors
    };
}

