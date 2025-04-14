export interface PaginationOptions {
  page?: number; // Make optional for default values
  limit?: number; // Make optional for default values
  sortBy?: string; // Optional field to sort by
  sortOrder?: 'ASC' | 'DESC'; // Optional sort order
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
