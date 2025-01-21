const express = require('express')
const router = express.Router();
const eventsController = require('../controllers/eventsController');


router.route('/category').get(eventsController.getTreeFromCategory);
router.route('/events').get(eventsController.getByCategory)
router.route('/events/:eventId').get(eventsController.getEventById)

module.exports = router;