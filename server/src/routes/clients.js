// server/src/routes/clients.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientsController');
const { authenticateToken, authorizeAdmin, authorizeUser } = require('../middlewares/auth');

// Rutas CRUD base: la ruta base aquí es '/clients' desde server.js
router.get('/', authenticateToken, authorizeUser, ctrl.getAllClients);       // GET /clients
router.get('/:id', authenticateToken, authorizeUser, ctrl.getClientById);    // GET /clients/:id
router.post('/', authenticateToken, authorizeAdmin, ctrl.createClient);       // POST /clients
router.put('/:id', authenticateToken, authorizeAdmin, ctrl.updateClient);     // PUT /clients/:id
router.delete('/:id', authenticateToken, authorizeAdmin, ctrl.deleteClient);  // DELETE /clients/:id

module.exports = router;
