const tokenServices = require('../services/token-services.js')

module.exports = async (req, res, next) => {
    try {
        // console.log('<inside auth-middleware>')
        const { accessToken } = req.cookies
        // console.log('<auth-middleware>', req.cookies)
        if(!accessToken) throw new Error()
        const userData = await tokenServices.verifyAccessToken(accessToken)
        if(!userData) throw new Error()
        // console.log(userData)
        req.user = userData
        next();
    } catch (error) {
        // console.log('<auth-middleware> ERROR')
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        })
    }
}