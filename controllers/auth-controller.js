const otpServices = require('../services/otp-services.js')
const hashServices = require('../services/hash-services.js')

class AuthController {
    async sendOTP(req, res) {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Phone required.'
            })
        }
        const OTP = await otpServices.generateOTP(4)
        const expires = Date.now() + 1000 * 60 * 2
        const hash = hashServices.hashOTP(`${email}.${OTP}.${expires}`)
        try {
            await otpServices.sendByEmail(email, OTP)
            return res.json({ hash, expires, email })
        } catch (error) {
            res.json({ success: false, error })
        }
    }
}

module.exports = new AuthController()
