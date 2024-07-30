const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

/*
    Objective: Create a new User, then respond with the user and a token
    Type: POST
*/
router.post('/api/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

/*
    Objective: Log the User In
    Type: POST
    Functionality: Create a new token, then respond with the user and a token
*/
router.post('/api/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

/*
    Objective: Log the User Out
    Type: POST
    Functionality: Removes the current token associated with the user on the device from the database
*/
router.post('/api/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

/*
    Objective: Log the User Out from every device
    Type: POST
    Functionality: Removes all the tokens associated with the user on any devices from the database
*/
router.post('/api/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

/*
    Objective: Retrieve User Profile
    Type: GET
    Functionality: Respond to client side with the users information
*/
router.get('/api/users/me', auth, async (req, res) => {
    res.send(req.user)
})

/*
    Objective: Find a perticular User within the database
    Type: GET
    Functionality: Respond with the informations of a perticular user
*/
router.get('/api/users/:id', async (req,res) => {
    const _id = req.params.id 

    try {
        const user = await User.findById(_id)

        if(!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

/*
    Objective: Update User information
    Type: PATCH
    Functionality: Updates the users information based upon if its an allowed update
*/
router.patch('/api/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

/*
    Objective: Delete the User from the database
    Type: DELETE
    Functionality: Removes the User from the database all together
*/
router.delete('/api/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router