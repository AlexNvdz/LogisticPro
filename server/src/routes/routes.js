// server/src/routes/routes.js
const express = require('express');
const { getAllRoutes, createRoute } = require('../controllers/routeController');
const { getAddressFromCoordinates } = require('../controllers/geocodeController');

const router = express.Router();

router.get('/', getAllRoutes);
router.post('/', createRoute);
router.post('/geocode', getAddressFromCoordinates);

module.exports = router;
