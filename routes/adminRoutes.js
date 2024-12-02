const express = require('express')
const router = express.Router(); 
const adminController = require('../controllers/adminController');
const protectAdmin = require('../utils/protectAdmin');

router.use(protectAdmin);


router.route(`/admin/:queryParam`).get(adminController.getAllInfo);
router.route(`/admin/:modelParam`).delete(adminController.deleteData);
router.route(`/admin/:modelParam`).put(adminController.updateData);
router.route(`/admin/:queryParam`).post(adminController.createFunction);

module.exports = router;