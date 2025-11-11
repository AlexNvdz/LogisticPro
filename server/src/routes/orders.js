// server/src/routes/orders.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordersController');

router.get('/', ctrl.getAllOrders);        // GET /orders
router.get('/:id', ctrl.getOrderById);     // GET /orders/:id
router.post('/', ctrl.createOrder);        // POST /orders
router.put('/:id', ctrl.updateOrder);      // PUT /orders/:id
router.delete('/:id', ctrl.deleteOrder);   // DELETE /orders/:id

module.exports = router;
