const express = require('express')
const router = express.Router();
const eventsController = require('../controllers/eventsController');


router.route('/category').get(eventsController.getByCategory);

module.exports = router;