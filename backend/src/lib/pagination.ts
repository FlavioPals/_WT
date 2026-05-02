export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function paginationSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

export function paginationMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) }
}
