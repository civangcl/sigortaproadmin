const { z } = require('zod');

// Schema to validate pagination query params
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

/**
 * Calculates Prisma `skip` and `take` based on validated page and limit
 */
function getPaginationArgs(page, limit) {
  return {
    skip: (page - 1) * limit,
    take: limit
  };
}

/**
 * Formats the paginated response
 */
function formatPaginatedResponse(items, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
}

module.exports = {
  paginationSchema,
  getPaginationArgs,
  formatPaginatedResponse
};
