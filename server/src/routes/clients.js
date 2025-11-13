// server/src/routes/clients.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientsController');
const { authenticateToken, authorizeAdmin, authorizeUser } = require('../middleware/authMiddleware');

// --- CAMBIOS AQUÍ ---
// TODOS los usuarios logueados (admin o no) pueden VER clientes
router.get('/', authenticateToken, authorizeUser, ctrl.getAllClients);
router.get('/:id', authenticateToken, authorizeUser, ctrl.getClientById);

// SOLO los admins pueden modificar clientes
router.post('/', authenticateToken, authorizeAdmin, ctrl.createClient);
router.put('/:id', authenticateToken, authorizeAdmin, ctrl.updateClient);
router.delete('/:id', authenticateToken, authorizeAdmin, ctrl.deleteClient);

module.exports = router;