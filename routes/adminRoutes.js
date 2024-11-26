const express = require('express')
const router = express.Router(); 
const adminController = require('../controllers/adminController');
const protectAdmin = require('../utils/protectAdmin');

router.use(protectAdmin);


router.route(`/admin/:queryParam`).get(adminController.getAllInfo);

module.exports = router;