const express = require('express')
const router = express.Router(); 
const adminController = require('../controllers/adminController');


router.route(`/admin/:queryParam`).get(adminController.getAllInfo);

module.exports = router;