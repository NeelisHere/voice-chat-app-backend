const express = require('express');
require('dotenv').config();
const router = require('./routes');
const { connectDB } = require('./database.js')

const PORT = process.env.PORT || 8000

connectDB()
const app = express()

app.use(express.json())
app.use('/api', router)

app.get('/', (req, res) =>{
    res.send('hi')
})


app.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`)
})