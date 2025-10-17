// server/src/routes/vehicles.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vehiclesController');

router.get('/', ctrl.getAllVehicles);       // GET /vehicles
router.get('/:id', ctrl.getVehicleById);    // GET /vehicles/:id
router.post('/', ctrl.createVehicle);       // POST /vehicles
router.put('/:id', ctrl.updateVehicle);     // PUT /vehicles/:id
router.delete('/:id', ctrl.deleteVehicle);  // DELETE /vehicles/:id

module.exports = router;
