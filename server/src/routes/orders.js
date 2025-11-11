// server/src/routes/orders.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordersController');
const { authenticateToken, authorizeUser, authorizeAdmin } = require('../middleware/authMiddleware);');

// Usuarios registrados pueden ver órdenes
router.get('/', authenticateToken, authorizeUser, ctrl.getAllOrders);
router.get('/:id', authenticateToken, authorizeUser, ctrl.getOrderById);

// Solo admins pueden crear, editar o eliminar órdenes
router.post('/', authenticateToken, authorizeAdmin, ctrl.createOrder);
router.put('/:id', authenticateToken, authorizeAdmin, ctrl.updateOrder);
router.delete('/:id', authenticateToken, authorizeAdmin, ctrl.deleteOrder);

module.exports = router;
