// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/usersController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

// Rutas CRUD para users (solo admins)
router.get('/', authenticateToken, authorizeAdmin, usersCtrl.getAllUsers);         // GET /users
router.get('/:id', authenticateToken, authorizeAdmin, usersCtrl.getUserById);     // GET /users/:id
router.post('/', authenticateToken, authorizeAdmin, usersCtrl.createUser);        // POST /users
router.put('/:id', authenticateToken, authorizeAdmin, usersCtrl.updateUser);      // PUT /users/:id
router.delete('/:id', authenticateToken, authorizeAdmin, usersCtrl.deleteUser);   // DELETE /users/:id

module.exports = router;
