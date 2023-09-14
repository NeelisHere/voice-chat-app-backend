const jwt = require('jsonwebtoken');
const RefreshModel = require('../models/refresh-model.js');

class TokenServices {
    async generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
            expiresIn: '1y'
        })
        return { accessToken, refreshToken }
    }
    async storeRefreshToken(token, userId) {
        try {
            await RefreshModel.create({ token, userId })
        } catch (error) {
            console.log(error.message)
        }
    }
}

module.exports = new TokenServices()