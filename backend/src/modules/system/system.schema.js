const { z } = require('zod');

const createCompanySchema = {
  body: z.object({
    name: z.string().min(2, "Şirket adı en az 2 karakter olmalıdır"),
    domain: z.string().optional().nullable(),
    ownerName: z.string().min(2, "Sahip adı zorunludur"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    adminUserId: z.string().min(1, "Admin User ID zorunludur")
  }).strict()
};

const getCompanyDetailsSchema = {
  params: z.object({
    id: z.string().min(1, "Geçerli bir şirket ID'si giriniz")
  })
};

module.exports = {
  createCompanySchema,
  getCompanyDetailsSchema
};
