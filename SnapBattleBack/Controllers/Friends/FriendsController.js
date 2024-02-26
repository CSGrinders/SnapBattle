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
 * - removeFriend: removes a friend from the user's friend's list and and vice versa
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
        const searchUser = await User.findOne({username: searchUsername})

        if (searchUser) {

            console.log(userID)
            console.log(searchUser._id)

            //user searched for themselves
            if (searchUser._id.toString() === userID) {
                return res.status(404).json({errorMessage: "You cannot search for yourself"})
            }

            //check if searched user is already a friend -> display profile without add friend button using viewType = 1
            for (let i = 0; i < searchUser.friends.length; i++) {
                if (searchUser.friends[i]._id.toString() === userID) {
                    console.log("huh")
                    return res.status(200).json({
                        searchName: searchUser.name,
                        searchUsername: searchUser.username,
                        searchBio: searchUser.biography,
                        searchID: searchUser._id.toString(),
                        viewType: 0
                    });
                }
            }

            //otherwise display profile with add friend button
            return res.status(200).json({
                searchName: searchUser.name,
                searchUsername: searchUser.username,
                searchBio: searchUser.biography,
                searchID: searchUser._id.toString(),
                viewType: 1
            });
        }
        else {
            return res.status(404).json({errorMessage: "User could not be found."});
        }
    } catch (error) {
        console.log("SearchUser module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
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

        //sending request from user A to user B
        const userA = await User.findById(userID).populate("requests")
        const userB = await User.findOne({username: receivingUsername});

        if (userA && userB) {

            //ensure that no request exists between userA and userB
            let requestExists = false;
            for (let i = 0; i < userB.requests.length; i++) {
                if (userB.requests[i].toString() === userID) {
                    requestExists = true;
                }
            }
            for (let i = 0; i < userA.requests.length; i++) {
                if (userA.requests[i].username === receivingUsername) {
                    requestExists = true
                }
            }
            if (requestExists) {
                res.status(400).json({errorMessage: "Friend request already exists."});
            }
            else {
                userB.requests.push(userID);
                await userB.save();
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

module.exports.denyFriendRequest = async (req, res, next) => {
    try {
        const {reqUsername} = req.body
        const {userID} = req.params

        //remove the friend request from the user that received the request
        let user = await User.findById(userID).populate("requests")
        let requests = user.requests
        for (let i = 0; i < requests.length; i++) {
            if (requests[i].username === reqUsername) {
                requests.splice(i, 1)
                break
            }
        }

        await user.save()

        //call getFriendRequests() to return the new updated list of friend requests back to the client
        next()
    }
    catch {
        return res.status(500).json({errorMessage: "Internal server error"})
    }
}

/**
 * Add small desc.
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.removeFriend = async (req, res, next) => {
    try {
        //user A
        const {userID} = req.params
        let userA = await User.findById(userID).populate('friends')
        let AFriends = userA.friends

        //user B
        const {removeUsername} = req.body
        let userB = await User.findOne({username: removeUsername}).populate('friends')
        let BFriends = userB.friends

        //ensure that user A and user B are friends
        let isFriends = false
        for (let i = 0; i < AFriends.length; i++) {
            if (AFriends[i].username === removeUsername) {
                isFriends = true
                break
            }
        }
        if (!isFriends) {
            return res.status(404).json({errorMessage: "You are not friends. Please reload the friends page"})
        }


        //remove user B from user A's friend list
        for (let i = 0; i < AFriends.length; i++) {
            if (AFriends[i].username === removeUsername) {
                AFriends.splice(i, 1)
                break
            }
        }
        await userA.save()

        //remove user A from user B's friend list
        for (let i = 0; i < BFriends.length; i++) {
            if (BFriends[i]._id.toString() === userID) {
                BFriends.splice(i, 1)
                break
            }
        }
        await userB.save()

        return res.status(200).json({message: "Friend successfully removed"})
    }
    catch {
        return res.status(500).json({errorMessage: "Internal server error"})
    }
}