// server/src/routes/routes.js
const express = require('express');
const { getAllRoutes, createRoute } = require('../controllers/routeController');
const { getAddressFromCoordinates } = require('../controllers/geocodeController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, getAllRoutes);
router.post('/', authenticateToken, authorizeAdmin, createRoute);
router.post('/geocode', authenticateToken, getAddressFromCoordinates);

module.exports = router;
