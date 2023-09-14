const Jimp = require('jimp');
const path = require('path');
const userServices = require('../services/user-services.js');
const UserDTOS = require('../dtos/user-dtos.js')

class ActivateController {
    async activate(req, res) {
        const { username, avatar } = req.body
        if(!username || !avatar){
            return res.status(401).json({
                success: false,
                message: 'All fields are required!'
            })
        }
        const bufferImage = new Buffer.from(avatar.split(',')[1], 'base64')
        const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`
        try {
            const jimpRes = await Jimp.read(bufferImage)
            jimpRes.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../storage/${imagePath}`))
            // console.log('->', jimpRes)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Could not process image.'
            })
        }
        const userId = req.user._id
        try {
            const user = await userServices.findUser({ _id: userId })
            if(!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                })
            }
            user.activated = true;
            user.username = username
            user.avatar = `/storage/${imagePath}`
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