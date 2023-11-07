const express = require('express');
require('dotenv').config();
const router = require('./routes');
const { connectDB } = require('./database.js')
const cors = require('cors')
const cp = require('cookie-parser')
const ACTIONS = require('./socket-actions.js')
const RoomModel = require('./models/room-model.js');

const PORT = process.env.PORT || 8000

connectDB()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
    }
})

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))
app.use(cp())
app.use(express.json({ limit: '30mb' }))
app.use('/api', router)
// for serving image files stored in the storage-folder
app.use('/storage', express.static('storage'))

app.get('/', (req, res) =>{
    res.send('hi')
})


const socketUserMapping = {}

io.on('connection', (socket) => {
    console.log('New Connection', socket.id)

    socket.on(ACTIONS.JOIN, async ({ roomId, user }) => {
        socketUserMapping[socket.id] = user
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        // console.log(clients)
        clients.forEach((clientId) => {
            /*** current user hasn't been joined in the room yet. ***/ 
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                // inform all the existing clients about the latest user joined, hence socket.id
                peerId: socket.id, 
                createOffer: false,
                user
            })
            socket.emit(ACTIONS.ADD_PEER, {
                // inform the latest user (current socket) about each client
                peerId: clientId,
                createOffer: true,
                user: socketUserMapping[clientId]
            })
        })
        try {
            await RoomModel.updateOne(
                { _id: roomId },
                { $push: { speakers: user._id } }
            )
        } catch (error) {
            console.log(error)
        }
        socket.join(roomId) // include the latest user in the room
    })
    //handle relay-ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate
        })
    })
    //handle relay-sdp (session description offer/answer)
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription
        })
    })
    // handle mute
    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        console.log('mute', userId)
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, { peerId: socket.id, userId })
        })
    })
    // handle unmute
    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        console.log('unmute', userId)
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, { peerId: socket.id, userId })
        })
    })
    // leave room
    const leaveRoom = async ({ roomId }) => {
        const { rooms } = socket
        try {
            await RoomModel.updateOne(
                { _id: roomId },
                { $pull: { speakers: socketUserMapping[socket.id]?._id } }
            )
        } catch (error) {
            console.log(error)
        }
        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMapping[socket.id]?._id
                })
                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMapping[clientId]?._id
                })
            })
            socket.leave(roomId)
        })
        delete socketUserMapping[socket.id]
    }
    socket.on(ACTIONS.LEAVE, leaveRoom)
    socket.on('disconnect', leaveRoom)
})

 
server.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`)
})

