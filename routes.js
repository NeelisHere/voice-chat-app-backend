const router = require('express').Router();

const authMiddleware = require('./middlewares/auth-middleware')

const authController = require('./controllers/auth-controller.js')
const activateController = require('./controllers/activate-controller.js')
const roomsController = require('./controllers/rooms-controller.js')




router.post('/send-otp', authController.sendOTP)
router.post('/verify-otp', authController.verifyOTP)
router.post('/activate', authMiddleware, activateController.activate)
router.get('/refresh', authController.refresh)
router.post('/logout', authMiddleware, authController.logout)
router.post('/rooms', authMiddleware, roomsController.create)
router.get('/rooms', authMiddleware, roomsController.getAllRooms)
router.get('/rooms/:roomId', authMiddleware, roomsController.getRoom)

module.exports = router