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

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true
        })

        const _user = new UserDTOS(user)
        return res.json({ auth: true, user: _user })
    }

    async refresh(req, res) {
        if (Object.keys(req.cookies).length === 0) {
            return res.status(200).json({
                isAuth: false,
                user: null
            })
        }
        // 1. get refresh token from cookie
        const { refreshToken: oldRefreshToken } = req.cookies
        
        // 2. refresh token is valid?
        let userData;
        try {
            userData = await tokenServices.verifyRefreshToken(oldRefreshToken)
        } catch (error) {
            // console.log('<verifyRefreshToken>')
            return res.status(401).json({
                message: 'Invalid token'
            })
        }
        // 3. refresh token is in db?
        try {
            const token = await tokenServices.findRefreshToken(userData._id, oldRefreshToken)
            if(!token) {
                // console.log('<findRefreshToken>')
                return res.status(401).json({
                    message: 'Invalid token'
                })
            }
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }
        // 4. user valid?
        const user = await userServices.findUser({ _id: userData._id })
        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        // 5. generate new access+refresh token
        const { refreshToken, accessToken } = await tokenServices.generateTokens({ _id: userData._id })
        // 6. update refresh token, store it in db
        try {
            await tokenServices.updateRefreshToken(userData._id, refreshToken)
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }
        // 7. send them in res.cookie 
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true
        })

        return res.json({ 
            isAuth: true, 
            user: new UserDTOS(user) 
        })
    }

    async logout(req, res) {
        // console.log('<inside logout-controller>')
        const { refreshToken } = req.cookies
        // 1. delete refresh token from db
        await tokenServices.removeToken(refreshToken)
        // 2. delete cookies 
        res.clearCookie('refreshToken')
        res.clearCookie('accessToken')
        res.json({
            success: true,
            user: null,
            isAuth: false
        })
    }
}

module.exports = new AuthController()
