const roomServices = require('../services/room-services.js')
const RoomDTO = require('../dtos/room-dto.js')

class RoomsController {
    async create(req, res) {
        const { topic, roomType } = req.body
        if (!topic || !roomType) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required!'
            })
        }
        const room = await roomServices.create({ 
            topic, 
            roomType,
            ownerId: req.user._id 
        })
        return res.json({ 
            success: true,
            room: new RoomDTO(room) 
        })
    }
}

module.exports = new RoomsController()