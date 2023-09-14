const router = require('express').Router();
const authController = require('./controllers/auth-controller.js')
const activateController = require('./controllers/activate-controller.js')
const authMiddleware = require('./middlewares/auth-middleware')

router.post('/send-otp', authController.sendOTP)
router.post('/verify-otp', authController.verifyOTP)
router.post('/activate', authMiddleware, activateController.activate)

module.exports = router