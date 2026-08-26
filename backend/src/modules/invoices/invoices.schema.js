const { z } = require('zod');

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0)
});

const createInvoiceSchema = z.object({
  invoiceNo: z.string().min(1),
  date: z.string().datetime(),
  taxRate: z.number().min(0),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  total: z.number().min(0),
  clientId: z.string().uuid(),
  items: z.array(invoiceItemSchema).min(1)
});

module.exports = {
  createInvoiceSchema
};
