const Jimp = require('jimp');
const path = require('path');
const userServices = require('../services/user-services.js');
const UserDTOS = require('../dtos/user-dtos.js')

class ActivateController {
    async activate(req, res) {
        const { username, avatar } = req.body
        // console.log(username, avatar)
        if (!username) {
            return res.status(401).json({
                success: false,
                message: 'All fields are required!'
            })
        }

        const userId = req.user._id
        try {
            const user = await userServices.findUser({ _id: userId })
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                })
            }
            user.activated = true;
            user.username = username
            user.avatar = avatar
            user.save()
            return res.json({
                success: true,
                auth: true,
                user: new UserDTOS(user),
            })

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Something went wrong.'
            })
        }
        
    }
}

module.exports = new ActivateController()