// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/usersController');

// Rutas CRUD para users
router.get('/', usersCtrl.getAllUsers);         // GET /users
router.get('/:id', usersCtrl.getUserById);     // GET /users/:id
router.post('/', usersCtrl.createUser);        // POST /users
router.put('/:id', usersCtrl.updateUser);      // PUT /users/:id
router.delete('/:id', usersCtrl.deleteUser);   // DELETE /users/:id

module.exports = router;
