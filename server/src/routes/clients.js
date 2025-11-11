// server/src/routes/clients.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientsController');

// Rutas CRUD base: la ruta base aquí es '/clients' desde server.js
router.get('/', ctrl.getAllClients);       // GET /clients
router.get('/:id', ctrl.getClientById);    // GET /clients/:id
router.post('/', ctrl.createClient);       // POST /clients
router.put('/:id', ctrl.updateClient);     // PUT /clients/:id
router.delete('/:id', ctrl.deleteClient);  // DELETE /clients/:id

module.exports = router;
