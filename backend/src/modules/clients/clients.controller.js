const clientsService = require('./clients.service');

async function listClients(req, res) {
  const { page, limit } = req.validated.query;
  const result = await clientsService.listClients({ context: req.context, page, limit });
  res.json(result);
}

async function createClient(req, res) {
  const client = await clientsService.createClient({ context: req.context, input: req.validated.body });
  res.json({ success: true, client });
}

async function updateClient(req, res) {
  const { id } = req.validated.params;
  const client = await clientsService.updateClient({ context: req.context, id, input: req.validated.body });
  res.json({ success: true, client });
}

async function deleteClient(req, res) {
  const { id } = req.validated.params;
  await clientsService.deleteClient({ context: req.context, id });
  res.json({ success: true });
}

module.exports = {
  listClients,
  createClient,
  updateClient,
  deleteClient
};
