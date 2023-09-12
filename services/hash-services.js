const crypto = require('crypto')

class HashServices {
    hashOTP(data) {
        const secret = process.env.HASH_SECRET
        return crypto.createHmac('sha256', secret).update(data).digest('hex')
    }
}

module.exports = new HashServices()