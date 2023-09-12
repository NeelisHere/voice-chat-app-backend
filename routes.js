const router = require('express').Router();
const authController = require('./controllers/auth-controller.js')

router.post('/send-otp', authController.sendOTP)


module.exports = router