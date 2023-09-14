const express = require('express');
require('dotenv').config();
const router = require('./routes');
const { connectDB } = require('./database.js')
const cors = require('cors')

const PORT = process.env.PORT || 8000

connectDB()
const app = express()

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))
app.use(express.json())
app.use('/api', router)

app.get('/', (req, res) =>{
    res.send('hi')
})


app.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`)
})