const otpServices = require('../services/otp-services.js')
const hashServices = require('../services/hash-services.js')
const userServices = require('../services/user-services.js')
const tokenServices = require('../services/token-services.js')
const UserDTOS = require('../dtos/user-dtos.js')

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
            return res.json({ success: false, error })
        }
    }

    async verifyOTP(req, res) {
        const { email, OTP, hash, expires } = req.body
        if (!OTP || !email || !hash) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            })
        }
        if (Date.now() > Number(expires)) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired.'
            })
        }
        const newData = `${email}.${OTP}.${expires}`
        const isValid = otpServices.verifyOTP(hash, newData)
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: `Invalid OTP`
            })
        }
        let user;
        try {
            user = await userServices.findUser({ email })
            if (!user) {
                user = await userServices.createUser({ email })
            }
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }
        const payload = {
            _id: user._id,
            activated: false
        }
        const { accessToken, refreshToken } = await tokenServices.generateTokens(payload)

        await tokenServices.storeRefreshToken(refreshToken, user._id)

        res.cookie('refresh-token', refreshToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true
        })

        res.cookie('access-token', accessToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true
        })

        const _user = new UserDTOS(user)
        return res.json({ auth: true, user: _user })
    }
}

module.exports = new AuthController()
