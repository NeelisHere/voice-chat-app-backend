class UserDTOS {
    _id; email; activated; createdAt; username; avatar; 
    constructor(user) {
        const { _id, email, activated, createdAt, username, avatar } = user
        this._id = _id
        this.activated = activated
        this.createdAt = createdAt
        this.email = email
        this.username = username
        this.avatar = avatar? `${process.env.API_BASE_URL}${avatar}` : null
    }
}

module.exports = UserDTOS