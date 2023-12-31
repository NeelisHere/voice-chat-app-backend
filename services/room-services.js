const RoomModel = require('../models/room-model.js');

class RoomsServices {
    async create(payload) {
        const { topic, roomType, ownerId } = payload;
        const room = await RoomModel.create({
            topic, roomType, ownerId, speakers: []
        })
        return room;
    }

    async getAllRooms(roomTypeList) {
        const rooms = await RoomModel.find({ roomType: { $in: roomTypeList } })
                                    .populate('speakers')
                                    .populate('ownerId')
                                    .exec()
        // console.log(rooms[0].speakers)
        return rooms
    }

    async getRoom(roomId) {
        const room = await RoomModel.findOne({ _id: roomId })
        return room
    }
}

module.exports = new RoomsServices()