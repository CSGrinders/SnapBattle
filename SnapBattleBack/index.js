/*
 * Index.js
 *
 * Backend main.
 *
 * Functionalities:
 * - Initializes the Express.
 * - Connects to MongoDB using mongoose.
 * - Configures CORS to allow cross-origin requests.
 * - Routers (authRouter, groupsRouter, profileRouter, friendsRouter) to manage different functionalities.
 * - Secures user routes with userVerification middleware.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
const bodyParser = require('body-parser');
const groupsRouter = require('./Routes/User/GroupsRoutes')
const authRouter = require('./Routes/AuthRoute')
const profileRouter = require('./Routes/User/ProfileRoutes')
const friendsRouter = require('./Routes/User/FriendsRoutes')
const {userVerification} = require("./Controllers/Auth/AuthController");
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
//pp.use(
//    cors({
 //       origin: [`http://localhost:3000`],
//        methods: ["GET", "POST", "PUT", "DELETE"],
//        credentials: true,
 ///)

//parses json data from request body and makes it available in req.body
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// Routes
app.use("/auth", authRouter)
app.use("/user", userVerification)
app.use("/user/:userID/groups", groupsRouter)
app.use("/user/:userID/profile", profileRouter)
app.use("/user/:userID/friends", friendsRouter)