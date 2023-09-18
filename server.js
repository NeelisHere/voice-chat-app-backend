const express = require('express');
require('dotenv').config();
const router = require('./routes');
const { connectDB } = require('./database.js')
const cors = require('cors')
const cp = require('cookie-parser')

const PORT = process.env.PORT || 8000

connectDB()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: 'https://localhost:3000',
        methods: ['GET', 'POST']
    }
})

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))
app.use(cp())
app.use(express.json({ limit: '10mb' }))
app.use('/api', router)
app.use('/storage', express.static('storage'))// for serving image files stored in the storage-folder

app.get('/', (req, res) =>{
    res.send('hi')
})


io.on('connection', (socket) => {
    console.log('New Connection', socket.id)
})


server.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`)
})

