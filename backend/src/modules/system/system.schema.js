const { z } = require('zod');

const createOnboardSchema = {
  body: z.object({
    company: z.object({
      name: z.string().min(2, "Şirket adı en az 2 karakter olmalıdır"),
      customerNo: z.string().optional(),
      domain: z.string().optional().nullable(),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      address: z.string().optional(),
    }),
    owner: z.object({
      fullName: z.string().min(2, "Sahip adı zorunludur"),
      email: z.string().email("Geçerli bir e-posta adresi giriniz"),
      phone: z.string().optional(),
    }),
    branch: z.object({
      name: z.string().default("Merkez")
    }),
    website: z.object({
      active: z.boolean().default(false),
      domain: z.string().optional()
    }).optional(),
    subscription: z.object({
      status: z.string().default("TRIAL") // TRIAL, ACTIVE
    }).optional()
  }).strict()
};

const getCompanyDetailsSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir şirket ID'si (UUID) giriniz")
  })
};

module.exports = {
  createOnboardSchema,
  getCompanyDetailsSchema
};
