class UserDTOS {
    _id; email; activated; createdAt;
    constructor(user) {
        const { _id, email, activated, createdAt } = user
        this._id = _id
        this.activated = activated
        this.createdAt = createdAt
        this.email = email
    }
}

module.exports = UserDTOS