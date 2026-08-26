const messagesService = require('./messages.service');

async function listMessages(req, res) {
  const { page, limit } = req.validated.query;
  const result = await messagesService.listMessages({ context: req.context, page, limit });
  res.json(result);
}

async function updateMessageStatus(req, res) {
  const { id } = req.validated.params;
  await messagesService.updateMessageStatus({ context: req.context, id, input: req.validated.body });
  res.json({ success: true });
}

module.exports = {
  listMessages,
  updateMessageStatus
};
