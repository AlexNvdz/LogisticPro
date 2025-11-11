// server/src/routes/auth.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', auth.authenticateToken, ctrl.me);
module.exports = router;
