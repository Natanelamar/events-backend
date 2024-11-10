const usersController = require('../controllers/usersController');
const express = require('express')
const router = express.Router();

router.route('/register/users').post(usersController.create);
router.route('/login').post (usersController.login);
router.route('/auth').get(usersController.isAuthonticatd);


module.exports = router;