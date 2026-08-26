const { z } = require('zod');

const updateMessageStatusSchema = {
  params: z.object({
    id: z.string().uuid("Geçerli bir ID formatı (UUID) giriniz")
  }),
  body: z.object({
    status: z.nativeEnum(require('../../constants/enums').MessageStatus, { errorMap: () => ({ message: "Geçersiz durum" }) })
  }).strict()
};

module.exports = {
  updateMessageStatusSchema
};
