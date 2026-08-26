const { z } = require('zod');

const updateCompanySchema = {
  body: z.object({
    id: z.string().min(1, 'Şirket ID zorunludur'),
    name: z.string().min(2, 'Şirket adı en az 2 karakter olmalıdır').optional(),
    ownerName: z.string().min(2, 'Sahip adı en az 2 karakter olmalıdır').optional(),
    iban: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Geçerli bir email giriniz').optional().nullable(),
    monthlyTarget: z.number().nonnegative('Hedef negatif olamaz').optional().nullable()
  }).strict().refine(data => Object.keys(data).length > 1, {
    message: "En az bir alanı güncellemelisiniz"
  })
};

module.exports = {
  updateCompanySchema
};
