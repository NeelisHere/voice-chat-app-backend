const mongoose  = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    activated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true}) 

module.exports = mongoose.model('User', userSchema, '_users')