const { z } = require('zod');

const createExpenseSchema = {
  body: z.object({
    amount: z.number().positive('Gider tutarı sıfırdan büyük olmalıdır'),
    description: z.string().min(2, 'Açıklama en az 2 karakter olmalıdır'),
    date: z.string().datetime({ message: 'Geçerli bir tarih formatı giriniz (ISO-8601)' })
  }).strict()
};

module.exports = {
  createExpenseSchema
};
