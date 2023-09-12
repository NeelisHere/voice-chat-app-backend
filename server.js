const express = require('express');
require('dotenv').config();
const router = require('./routes');
const PORT = process.env.PORT || 8000

const app = express()

app.use(express.json())
app.use('/api', router)

app.get('/', (req, res) =>{
    res.send('hi')
})


app.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`)
})