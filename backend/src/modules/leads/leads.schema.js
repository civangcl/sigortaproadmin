const { z } = require('zod');

// Public lead submission validation
const createPublicLeadSchema = {
  body: z.object({
    insuranceType: z.string().min(2, 'Sigorta türü geçersiz'),
    fullName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    tcIdentity: z.string().optional().nullable().or(z.literal('')),
    phone: z.string().min(5, 'Geçerli bir telefon giriniz'),
    email: z.string().email('Geçerli bir email giriniz').optional().nullable().or(z.literal('')),
    dateOfBirth: z.string().optional().nullable().or(z.literal('')),
    city: z.string().optional().nullable().or(z.literal('')),
    address: z.string().optional().nullable().or(z.literal('')),
    licensePlate: z.string().optional().nullable().or(z.literal('')),
    documentNo: z.string().optional().nullable().or(z.literal(''))
  }).strip()
};

// CRM internal update validation
const updateLeadStatusSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  }),
  body: z.object({
    status: z.nativeEnum(require('../../constants/enums').LeadStatus),
    premium: z.number().nonnegative().optional().nullable(),
    commission: z.number().nonnegative().optional().nullable()
  }).strict()
};

const deleteLeadSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  })
};

module.exports = {
  createPublicLeadSchema,
  updateLeadStatusSchema,
  deleteLeadSchema
};
