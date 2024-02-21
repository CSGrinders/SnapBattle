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
const bodyParser = require('body-parser');
const groupsRouter = require('./Routes/User/Groups/Groups')
const authRouter = require('./Routes/Auth')
const profileRouter = require('./Routes/User/Profile/Profile')
const searchRouter = require('./Routes/User/Friends/Search')
const {userVerification} = require("./Controllers/Auth/Auth");
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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// Routes
app.use("/auth", authRouter)
app.use("/user", userVerification)
app.use("/user/:userID/groups", groupsRouter)
app.use("/user/:userID/profile", profileRouter)
app.use("/user/:userID/search", searchRouter)