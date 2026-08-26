const { z } = require('zod');

const createClientSchema = {
  body: z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    tc: z.string().optional().nullable(),
    phone: z.string().min(5, 'Geçerli bir telefon giriniz').optional().nullable(),
    email: z.string().email('Geçerli bir email giriniz').optional().nullable(),
    city: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    plate: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.string().optional().nullable(),
    engineNo: z.string().optional().nullable(),
    chassisNo: z.string().optional().nullable()
  }).strict()
};

const updateClientSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  }),
  body: createClientSchema.body.partial().refine(data => Object.keys(data).length > 0, {
    message: "Güncellenecek veri bulunamadı"
  })
};

const deleteClientSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  })
};

module.exports = {
  createClientSchema,
  updateClientSchema,
  deleteClientSchema
};
