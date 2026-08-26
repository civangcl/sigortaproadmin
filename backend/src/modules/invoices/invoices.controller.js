const invoicesService = require('./invoices.service');
const { createInvoiceSchema } = require('./invoices.schema');

async function listInvoices(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await invoicesService.listInvoices({
      context: req.context,
      page,
      limit
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createInvoice(req, res, next) {
  try {
    const validatedData = createInvoiceSchema.parse(req.body);
    const invoice = await invoicesService.createInvoice({
      context: req.context,
      input: validatedData
    });
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
}

async function deleteInvoice(req, res, next) {
  try {
    const { id } = req.params;
    await invoicesService.deleteInvoice({
      context: req.context,
      id
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listInvoices,
  createInvoice,
  deleteInvoice
};
