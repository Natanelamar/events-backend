const express = require('express')
const router = express.Router();
const purchasesController = require('../controllers/purchasesController');

router.route('/event-purchas/:event_id/:user_id/:quantity').post(purchasesController.buyTicket);

module.exports = router