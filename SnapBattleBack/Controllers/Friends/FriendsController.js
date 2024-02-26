/*
 * FriendsController.js
 *
 * This controller handles all the functionalities for managing friends.
 *
 * Functionalities:
 * - searchUser: Allows users to search for other users by username.
 * - sendFriendRequest: Allows users to send friend requests to others.
 * - getFriendRequests: Retrieves a list of incoming friend requests for the user, allowing them to see who wants to be
 * friends with them.
 * - getFriends: Lists all the friends of a user.
 * - acceptFriendRequest: Allows users to accept friend requests.
 * - denyFriendRequest: Allows users to deny friend requests.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {User} = require("../../Models/User");

/**
 * Add small desc.
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.searchUser = async(req, res) => {
    try {
        const {userID, searchUsername} = req.params;
        const searchUser = await User.findOne({username: searchUsername});

        if (searchUser) {
            res.status(200).json({
                searchName: searchUser.name,
                searchUsername: searchUser.username,
                searchBio: searchUser.biography,
                searchID: searchUser._id.toString(),
            });
        }
        else {
            res.status(404).json({errorMessage: "User could not be found."});
        }
    } catch (error) {
        console.log("SearchUser module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * Add small desc.
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.sendFriendRequest = async(req, res) => {
    try {
        const {userID} = req.params;
        const {receivingUsername} = req.body;
        console.log("SendFriendRequest module: User ${userID} sending a request to ${receivingUsername}");
        const receivingUser = await User.findOne({username: receivingUsername});

        if (receivingUser) {
            let requestExists = false;
            for (let i = 0; i < receivingUser.requests.length; i++) {
                if (receivingUser.requests[i].toString() === userID) {
                    requestExists = true;
                }
            }

            if (requestExists) {
                res.status(400).json({errorMessage: "Friend request already sent."});
            }
            else {
                receivingUser.requests.push(userID);
                await receivingUser.save();
                res.status(200).json({message: "Friend request sent successfully."});
            }
        }
        else {
            res.status(404).json({errorMessage: "User could not be found."});
        }


    } catch (error) {
        console.log("SendFriendRequest module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * Add small desc.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.getFriendRequests = async (req, res) => {
    console.log("getFriendRequests module: Request received.");
    try {
        const {userID} = req.params;
        const user = await User.findById(userID, 'requests').populate('requests');

        if (user) {
            let requests = user.requests;
            requests = requests.map((request) => ({
                username: request.username,
                //TODO: profile picture
            }))
            res.status(200).json({requests});
        }
        else {
            res.status(404).json({errorMessage: "User could not be found."});
        }


    } catch (error) {
        console.log("getFriendRequests module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * Add small desc.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.getFriends = async (req, res) => {
    try {
        const {userID} = req.params;
        const user = await User.findById(userID, 'friends').populate('friends');

        if (user) {
            let friends = user.friends;
            friends = friends.map((friend) => ({
                username: friend.username,
                //TODO: profile picture
            }))
            res.status(200).json({friends});
        }
        else {
            res.status(404).json({errorMessage: "User could not be found."});
        }

    } catch (error) {
        console.log("getFriends module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * Add small desc.
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.acceptFriendRequest = async (req, res) => {
    console.log("acceptFriendRequest module: Request received.");
    try {
        const {reqUsername} = req.body;
        const {userID} = req.params;

        //update the user that sent the friend request
        let user = await User.findOne({username: reqUsername});
        let friends = user.friends;
        friends.push(userID);
        await user.save();

        //update the user that received the friend request
        user = await User.findById(userID).populate('requests friends');
        let friendRequests = user.requests;
        friends = user.friends;
        for (let i = 0; i < friendRequests.length; i++) {
            if (friendRequests[i].username === reqUsername) {
                friends.push(friendRequests[i]._id);
                friendRequests.splice(i, 1);
            }
        }
        await user.save();

        user = await User.findById(userID).populate('friends requests');
        friendRequests = user.requests;
        friends = user.friends;
        friendRequests = friendRequests.map((user) => ({
            username: user.username,
            //TODO: profile picture
        }))

        friends = friends.map((user) => ({
            username: user.username,
            //TODO: profile picture
        }))


        console.log("acceptFriendRequest module: 200 returned. Req length: " + friendRequests.length);
        res.status(200).json({friends, friendRequests});
    } catch (error) {
        console.log("acceptFriendRequest module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * Add small desc.
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.denyFriendRequest = async (req, res) => {

}