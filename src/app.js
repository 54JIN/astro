const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')

const app = express()

app.use(express.json())
app.use(userRouter)

//Send a better response
app.get('/api', async(req,res) => {
    res.send({message: 'Hello'})
})

module.exports = app