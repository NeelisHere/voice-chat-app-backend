const RoomModel = require('../models/room-model.js');

class RoomsServices {
    async create(payload) {
        const { topic, roomType, ownerId } = payload;
        const room = await RoomModel.create({
            topic, roomType, ownerId, speakers: [ownerId]
        })
        return room;
    }
}

module.exports = new RoomsServices()