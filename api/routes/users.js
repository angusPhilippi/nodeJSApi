const express = require('express');
const router = express.Router();
const checkAuth = require("../auth/check-auth");
const UsersController = require('../controllers/users');

router.get('/', checkAuth, UsersController.users_get_all);

router.delete('/:userId', checkAuth, UsersController.users_delete);

router.post('/signup', UsersController.users_signup);

router.post('/login', UsersController.users_login);



module.exports = router;