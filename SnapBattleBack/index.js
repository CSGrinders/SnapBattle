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
const socketIo = require("socket.io");
const bodyParser = require('body-parser');
const groupsRouter = require('./Routes/User/GroupsRoutes')
const authRouter = require('./Routes/AuthRoute')
const profileRouter = require('./Routes/User/ProfileRoutes')
const friendsRouter = require('./Routes/User/FriendsRoutes')
const {userVerification} = require("./Controllers/Auth/AuthController");
const jwt = require("jsonwebtoken");
require("dotenv").config()
const {MONGO_URL, PORT} = process.env;
const {createServer} = require("http");
const {groupUpdates} = require("./ServerSocketControllers/GroupMainSocket");
const {friendUpdates} = require("./ServerSocketControllers/FriendsSocket");
const {otherUpdates} = require("./ServerSocketControllers/ProfileSocket");
const {groupHomeUpdates} = require("./ServerSocketControllers/GroupHomeSocket");
const Group = require("./Models/Group");
const { resetPointsHelper } = require("./Controllers/Groups/GroupPointsController");
const app = express()
const server = createServer(app);
const io = socketIo(server);

//WebSockets
groupUpdates(io, server);
friendUpdates(io, server);
otherUpdates(io, server);
groupHomeUpdates(io, server);

// Connect to MongoDB
mongoose
    .connect(MONGO_URL)
    .then(() => console.log("MongoDB is  connected successfully"))
    .catch((err) => console.error(err))


// Start the server and listen on the  PORT(Env file)
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});



// Configure CORS middleware
app.use(
    cors({
        origin: [`http://localhost:8000`],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
 ))

//parses json data from request body and makes it available in req.body
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// middleware for checking time based events
app.use('/user/:userID/groups/:groupID', async (req, res, next) => {
    try {
            // GET request
    if (req.method === 'GET') {
        const {groupID, userID} = req.params;
        console.log("userID:", userID,"GroupID:",groupID)   
        if (groupID !== undefined) {
            const group = await Group.findById(groupID);
            if (!group) {
                console.log("Group not found")
            }

            const currentDate = new Date();
            const targetDate = group.lastPeriod

            targetDate.setDate(targetDate.getDate() + 2);
            console.log(currentDate.getTime(), targetDate.getTime())
            if (currentDate.getTime() > targetDate.getTime()) {
                console.log("current date is 2 days after groups.lastPeriod")
                resetPointsHelper(groupID)
                group.lastPeriod = new Date();
                group.save();
            }
        }
    }
    console.log('Middleware executed before routes from groupsRouter');
    // Call next() to continue with the route handling
    next();
    } catch (error) {
        console.log(error)
        next()
    }
});

// Routes
app.use("/auth", authRouter)
app.use("/user", userVerification)
app.use("/user/:userID/groups", groupsRouter)
app.use("/user/:userID/profile", profileRouter)
app.use("/user/:userID/friends", friendsRouter)