const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userLogin');

router.post('/login', userCtrl.login);


module.exports = router;