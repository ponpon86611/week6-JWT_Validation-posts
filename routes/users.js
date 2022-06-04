const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const handleErrorAsync = require('../services/handleErrorAsync');


router.post('/sign_up', handleErrorAsync(userController.signUp));

router.post('/sign_in', handleErrorAsync(userController.signIn));

module.exports = router;
