const express = require('express');
require('dotenv').config();
const router = require('./routes');
const { connectDB } = require('./database.js')
const cors = require('cors')
const cp = require('cookie-parser')
const ACTIONS = require('./socket-actions.js')

const PORT = process.env.PORT || 8000

connectDB()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
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
// for serving image files stored in the storage-folder
app.use('/storage', express.static('storage'))

app.get('/', (req, res) =>{
    res.send('hi')
})

const socketUserMapping = {}

io.on('connection', (socket) => {
    console.log('New Connection', socket.id)

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        console.log('[***]')
        socketUserMapping[socket.id] = user
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        // console.log('[]', clients)
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user
            })
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMapping[clientId]
            })
        })
        
        socket.join(roomId)
        console.log(clients)
    })
    //handle relay-ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        console.log('<ice candidate in relay-ice>', icecandidate)
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate
        })
    })
    //handle relay-sdp (session description offer/answer)
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_SECRIPTION, {
            peerId: socket.id,
            sessionDescription
        })
    })

    // leave room
    const leaveRoom = async ({ roomId }) => {
        const { rooms } = socket
        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(io.socket.adapter.rooms.get() || [])
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMapping[socket.id]._id
                })
                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMapping[clientId]._id
                })
            })
            socket.leave(roomId)
        })
        delete socketUserMapping[socket.id]
    }
    socket.on(ACTIONS.LEAVE, leaveRoom)
})


server.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`)
})


// app.listen(PORT, () => {
//     console.log(`listening temp`)
// })