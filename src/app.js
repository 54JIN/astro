const express = require('express')
require('./db/mongoose') //Database

// API Routes
const userRouter = require('./routers/user')

const app = express()

app.use(express.json())

// Configuring the routes to the application
app.use(userRouter)

//Send a better response
app.get('/api', async(req,res) => {
    res.send({message: 'Hello'})
})

module.exports = app