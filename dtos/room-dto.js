class RoomDTO {
    _id; topic; roomType; speakers; ownerId; createdAt; 
    constructor(room) {
        const { _id, topic, roomType, speakers, ownerId, createdAt,  } = room
        
        this._id = _id
        this.topic = topic
        this.createdAt = createdAt
        this.roomType = roomType
        this.speakers = speakers
        this.ownerId = ownerId
    }
}

module.exports = RoomDTO