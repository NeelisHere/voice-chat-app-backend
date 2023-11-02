const roomServices = require('../services/room-services.js')
const RoomDTO = require('../dtos/room-dto.js')
const roomModel = require('../models/room-model.js')

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
    
    async getAllRooms(req, res) {
        const rooms = await roomServices.getAllRooms(['open', 'social', 'closed'])
        res.json({ success: true, rooms })
    }

    async getRoom(req, res) {
        const room = await roomServices.getRoom(req.params.roomId)
        return res.json({
            success: true,
            room
        })
    }

    async editRoom(req, res) {
        const { roomId } = req.params
        const updatedRoom = await roomModel.findOneAndUpdate({ _id: roomId }, req.body)
        return res.json({
            success: true,
            updatedRoom
        })
    }

    async deleteRoom(req, res) {
        const { roomId } = req.params
        const deletedRoom = await roomModel.findOneAndDelete({ _id: roomId })
        return res.json({
            success: true,
            deletedRoom
        })
    }

}

module.exports = new RoomsController()