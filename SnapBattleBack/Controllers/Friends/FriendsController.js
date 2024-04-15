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
const {ref, getDownloadURL} = require("firebase/storage");
const storage = require("../../Firebase/Firebase");
const {sendFriendRequest, sendFriendUpdate} = require("../../ServerSocketControllers/FriendsSocket");
const {sendUpdateProfileStatus} = require("../../ServerSocketControllers/ProfileSocket");
const {findUser} = require("../Profile/ProfileController");
const Group = require("../../Models/Group");
const Prompt = require("../../Models/Prompt");
const {unblock} = require("sharp");

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
        const user = await User.findById(userID).populate('blockedUsers', '_id');
        const searchUser = await User.findOne({username: searchUsername}).populate('requests').populate('blockedUsers', '_id')
        let pfpURL = '';
        try {
            const searchUserID = searchUser._id;
            const imageRef = ref(storage, `profileImage/${searchUserID}.jpeg`);
            pfpURL = await getDownloadURL(imageRef);
        } catch (error) {
            console.log("getPhoto in Friends: " + error);
        }

        if (searchUser) {
            //user searched for themselves
            if (searchUser._id.toString() === userID) {
                return res.status(404).json({errorMessage: "You cannot search for yourself."})
            }

            const isUserBlockA = searchUser.blockedUsers.some(userL => userL._id.toString() === user._id.toString());
            const isUserBlockB = user.blockedUsers.some(userL => userL._id.toString() === searchUser._id.toString());
            let both = false;
            if (isUserBlockB && isUserBlockA) {
                both = true;
            }
            if (!both) {
                if (isUserBlockA) {
                    return res.status(404).json({errorMessage: "User could not be found."});
                }
            }


            // check if searched user is blocked
            for (let i = 0; i < user.blockedUsers.length; i++) {
                console.log("blocked user id: " + user.blockedUsers[i]._id.toString());
                if (user.blockedUsers[i]._id.toString() === searchUser._id.toString()) {
                    console.log("user is blocked")
                    return res.status(200).json({
                        searchName: searchUser.name,
                        searchUsername: searchUser.username,
                        searchBio: searchUser.biography,
                        searchID: searchUser._id.toString(),
                        viewType: 2,
                        url: pfpURL,
                        requestExists: null,
                    });
                }
            }

            //check if searched user is already a friend -> display profile without add friend button using viewType = 1
            for (let i = 0; i < searchUser.friends.length; i++) {
                if (searchUser.friends[i]._id.toString() === userID) {
                    return res.status(200).json({
                        searchName: searchUser.name,
                        searchUsername: searchUser.username,
                        searchBio: searchUser.biography,
                        searchID: searchUser._id.toString(),
                        viewType: 0,
                        url: pfpURL,
                        requestExists: null,
                    });
                }
            }
            searchUser.populate('requests');
            let requestExists = searchUser.requests.some(request => request._id.toString() === userID);
            //otherwise display profile with add friend button
            return res.status(200).json({
                searchName: searchUser.name,
                searchUsername: searchUser.username,
                searchBio: searchUser.biography,
                searchID: searchUser._id.toString(),
                viewType: 1,
                url: pfpURL,
                requestExists: requestExists,
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

module.exports.removeRequest = async(req, res) => {
    try {
        const {userID} = req.params;
        const {usernameReq} = req.body;

        const userReq = await User.findOne({username: usernameReq}).populate('requests');
        if (!userReq) {
            return res.status(404).json({errorMessage: "User could not be found."});
        }

        userReq.requests = userReq.requests.filter(user => user._id.toString() !== userID);
        await userReq.save();
        await userReq.populate('requests', 'username');
        let requests = userReq.requests;
        requests = requests.map((request) => ({
            username: request.username,
        }));
        sendFriendRequest(userReq._id.toString(), requests);
        return res.status(200).json({data: false});
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
                    requestExists = true;
                }
            }
            if (requestExists) {
                res.status(400).json({errorMessage: "Friend request already exists."});
            }
            else {
                userB.requests.push(userID);
                await userB.save();
                await userB.populate('requests', 'username');
                let friendsR = userB.requests;
                friendsR = friendsR.map((request) => ({
                    username: request.username,
                }))
                sendFriendRequest(userB._id.toString(), friendsR);
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
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.unblock = async(req, res) => {
    try {
        const {userID} = req.params;
        const {unblockUsername} = req.body;

        const user = await User.findById(userID)
        const unblockUser = await User.findOne({username: unblockUsername})
        if (user && unblockUser) {
            user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== unblockUser._id.toString())
            await user.save();
            res.status(200).json({message: "User has been unblocked."});
        } else {
            res.status(404).json({errorMessage: "User could not be found."})
        }
    } catch (error) {
        console.log("unblock module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * Add small desc.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.getFriendsAndRequests = async (req, res) => {
    try {
        const {userID} = req.params;
        const user = await User.findById(userID, 'friends').populate('friends').populate('requests');

        if (user) {
            let friends = user.friends;
            friends = friends.map((friend) => ({
                username: friend.username,
            }))
            let requests = user.requests;
            requests = requests.map((request) => ({
                username: request.username,
            }))

            res.status(200).json({friends, requests});
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
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.getBlockedUsers = async (req, res) => {
    try {
        const {userID} = req.params;
        const user = await User.findById(userID)
        let users = [];
        let invalidUserIds = [];
        if (user) {
            for (const blocked of user.blockedUsers) {
                const blockedUser = await User.findById(blocked.toString());
                if (blockedUser) {
                    users.push({username: blockedUser.username});
                } else {
                    invalidUserIds.push(blocked.toString());
                }
                if (invalidUserIds && invalidUserIds.length > 0) {
                    user.blockedUsers = user.blockedUsers.filter(id => !invalidUserIds.includes(id.toString()));
                    await user.save();
                }
            }
            console.log(user);
            return res.status(200).json({users});
        }
        else {
            return res.status(404).json({errorMessage: "User could not be found."});
        }

    } catch (error) {
        console.log("getBlocked module: " + error);
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
        if (!user)  {
            user = await User.findById(userID).populate('friends requests');
            let friendRequests = user.requests;
            let friends = user.friends;
            friendRequests = friendRequests.filter(request => request.username !== reqUsername);
            friendRequests = friendRequests.map((user) => ({
                username: user.username,
                //TODO: profile picture
            }))

            friends = friends.map((user) => ({
                username: user.username,
                //TODO: profile picture
            }))

            console.log("acceptFriendRequest module: 200 returned. Req length: " + friendRequests.length);
            return res.status(200).json({friends, friendRequests});
        }
        let friends = user.friends;
        friends.push(userID);
        await user.save();

        await user.populate('friends');
        friends = user.friends;
        friends = friends.map((user) => ({
            username: user.username,
            //TODO: profile picture
        }))
        sendFriendUpdate(user._id.toString(), friends);
        const room = `${user._id.toString()}_otherprofile`
        sendUpdateProfileStatus(room, 0, "accept");
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
        let user = await User.findById(userID).populate("requests");
        if (!user)  {
            user = await User.findById(userID).populate('friends requests');
            let friendRequests = user.requests;
            let friends = user.friends;
            friendRequests = friendRequests.filter(request => request.username !== reqUsername);
            friendRequests = friendRequests.map((user) => ({
                username: user.username,
                //TODO: profile picture
            }))

            friends = friends.map((user) => ({
                username: user.username,
                //TODO: profile picture
            }))

            console.log("acceptFriendRequest module: 200 returned. Req length: " + friendRequests.length);
            return res.status(200).json({friends, friendRequests});
        }
        let requests = user.requests
        let room;
        for (let i = 0; i < requests.length; i++) {
            if (requests[i].username === reqUsername) {
                room = `${requests[i]._id.toString()}_otherprofile`
                requests.splice(i, 1)
                break
            }
        }

        await user.save();
        await user.populate('requests');
        requests = requests.map((request) => ({
            username: request.username,
        }))

        sendUpdateProfileStatus(room, false, "deny");
        res.status(200).json({requests});
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
        await userB.save();
        await userB.populate('friends');
        let friends = userB.friends;
        friends = friends.map((friend) => ({
            username: friend.username,
        }))
        sendFriendUpdate(userB._id.toString(), friends);
        return res.status(200).json({message: "Friend successfully removed"})
    }
    catch {
        return res.status(500).json({errorMessage: "Something went wrong..."})
    }
}




module.exports.blockUser = async(req, res, next) => {
    try {
        const {userID} = req.params;
        const {blockUsername} = req.body;

        //sending request from user A to user B
        const userA = await User.findById(userID).populate("blockedUsers")
        const userB = await User.findOne({username: blockUsername});

        if (userA && userB) {

            //Check if the user is already blocked
            const user = userA.blockedUsers.some(user => user._id.toString() === userB._id.toString());
            if (user) {
                return res.status(401).json({errorMessage: "This user is already blocked.", viewType: 2});
            }
            else {
                userA.blockedUsers.push(userB._id.toString());
                await userA.save();
                next();
            }
        }
        else {
            res.status(404).json({errorMessage: "User could not be found.", goBack: true});
        }

    } catch (error) {
        console.log("BlockUser module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.removeFriendBlock = async (req, res, next) => {
    try {
        //user A
        const {userID} = req.params
        let userA = await User.findById(userID).populate('friends').populate('requests', '_id username')
        let AFriends = userA.friends

        //user B
        const {blockUsername} = req.body
        let userB = await User.findOne({username: blockUsername}).populate('friends').populate('requests', '_id username');
        let BFriends = userB.friends

        //ensure that user A and user B are friends
        let isFriends = false
        for (let i = 0; i < AFriends.length; i++) {
            if (AFriends[i].username === blockUsername) {
                isFriends = true
                break
            }
        }
        if (!isFriends) {
            //Check for request if exist
            userA.requests = userA.requests.filter(user => user._id.toString() !== userB._id.toString());
            await userA.save();
            userB.requests = userB.requests.filter(user => user._id.toString() !== userID);
            await userB.save();
            userB.requests = userB.requests.map((request) => ({
                username: request.username,
            }));
            sendFriendRequest(userB._id.toString(), userB.requests);
            next();
        } else {


            //remove user B from user A's friend list
            for (let i = 0; i < AFriends.length; i++) {
                if (AFriends[i].username === blockUsername) {
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
            await userB.save();
            await userB.populate('friends');
            let friends = userB.friends;
            friends = friends.map((friend) => ({
                username: friend.username,
            }))
            sendFriendUpdate(userB._id.toString(), friends);
            next();
        }
    }
    catch {
        console.log("FriendRemoveBlock module: 500 error");
        return res.status(500).json({errorMessage: "Something went wrong..."})
    }
}