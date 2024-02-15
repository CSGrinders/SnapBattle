/*
 * Index.js
 *
 * This file sets up a server using Express.js
 * and connects it to a MongoDB database.
 *
 * @SnapBattle, 2023
 */

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
require("dotenv").config()
const {MONGO_URL, PORT} = process.env

// Connect to MongoDB
mongoose
    .connect(MONGO_URL)
    .then(() => console.log("MongoDB is  connected successfully"))
    .catch((err) => console.error(err))

// Start the server and listen on the  PORT(Env file)
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})

// Configure CORS middleware
app.use(
    cors({
        origin: [`http://localhost:3000`],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)

//parses json data from request body and makes it available in req.body
app.use(express.json())

// Routes
const groupsRouter = require('./Routes/Groups/Groups')
app.use('/groups', groupsRouter)