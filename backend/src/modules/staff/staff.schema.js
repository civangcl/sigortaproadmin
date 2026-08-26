const { z } = require('zod');

const schemas = {
  createStaffSchema: {
    body: z.object({
      userId: z.string().uuid("Geçerli bir User ID formatı giriniz"),
      role: z.string(),
      status: z.string().optional().default("ACTIVE"),
      allBranches: z.boolean().optional().default(false),
      branchIds: z.array(z.string().uuid()).optional()
    }).strict()
  },
  
  updateStaffSchema: {
    params: z.object({
      id: z.string().uuid("Geçerli bir Membership ID (UUID) giriniz")
    }),
    body: z.object({
      role: z.string().optional(),
      status: z.string().optional(),
      allBranches: z.boolean().optional(),
      branchIds: z.array(z.string().uuid()).optional()
    }).strict()
  }
};

module.exports = schemas;
