const express = require('express')
const router = express.Router();
const purchasesController = require('../controllers/purchasesController');

router.route('/event/buyEvent').post(purchasesController.buyTicket);

module.exports = router