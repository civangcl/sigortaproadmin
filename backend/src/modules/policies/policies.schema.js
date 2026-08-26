const { z } = require('zod');

const createPolicySchema = z.object({
  clientId: z.string().uuid(),
  type: z.string().min(1),
  companyName: z.string().optional(),
  policyNo: z.string().optional(),
  premium: z.number().min(0),
  commission: z.number().min(0).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

const updatePolicySchema = createPolicySchema.partial();

module.exports = {
  createPolicySchema,
  updatePolicySchema
};
