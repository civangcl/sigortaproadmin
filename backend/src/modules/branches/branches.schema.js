const { z } = require('zod');

const schemas = {
  createBranchSchema: {
    body: z.object({
      name: z.string().min(2, "Şube adı en az 2 karakter olmalıdır"),
      code: z.string().optional().nullable(),
      isActive: z.boolean().optional().default(true),
      phone: z.string().optional().nullable(),
      email: z.string().email("Geçerli bir email adresi giriniz").optional().nullable(),
      address: z.string().optional().nullable(),
    }).strict()
  },
  
  updateBranchSchema: {
    params: z.object({
      id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
    }),
    body: z.object({
      name: z.string().min(2, "Şube adı en az 2 karakter olmalıdır").optional(),
      code: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
      phone: z.string().optional().nullable(),
      email: z.string().email("Geçerli bir email adresi giriniz").optional().nullable(),
      address: z.string().optional().nullable(),
    }).strict()
  }
};

module.exports = schemas;
