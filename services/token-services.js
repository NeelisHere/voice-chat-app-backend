const jwt = require('jsonwebtoken');
const RefreshModel = require('../models/refresh-model.js');

class TokenServices {
    async generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: '1m'
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
    
    async verifyAccessToken(token) {
        return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
    }

    async verifyRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)
    }

    async findRefreshToken(userId, token) {
        try {
            return await RefreshModel.findOne({ userId, token })
        } catch (error) {
            throw error
        }
    }

    async updateRefreshToken(userId, token) {
        try {
            return await RefreshModel.updateOne({ userId },{ token })
        } catch (error) {
            throw error
        }
    }

    async removeToken(refreshToken) {
        await RefreshModel.deleteOne({ token: refreshToken })
    }
}

module.exports = new TokenServices()