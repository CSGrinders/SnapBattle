const {User} = require("../../Models/User")

module.exports.searchUser = async(req, res) => {
    try {
        const {userID, searchUsername} = req.params
        const searchUser = await User.findOne({username: searchUsername})

        if (searchUser) {
            res.status(200).json({
                searchName: searchUser.name,
                searchUsername: searchUser.username,
                searchBio: searchUser.biography
            })
        }
        else {
            res.status(404).json({errorMessage: "User could not be found"})
        }
    } catch {
        res.status(500).json({errorMessage: "Internal server error"})
    }
}

module.exports.sendFriendRequest = async(req, res) => {
    try {

        const {userID} = req.params
        const {receivingUsername} = req.body
        console.log(`User ${userID} sending a request to ${receivingUsername}`)
        const receivingUser = await User.findOne({username: receivingUsername})

        if (receivingUser) {
            let requestExists = false
            for (let i = 0; i < receivingUser.requests.length; i++) {
                if (receivingUser.requests[i].toString() === userID) {
                    requestExists = true
                }
            }

            if (requestExists) {
                console.log("hello")
                res.status(200).json({message: "Friend request already sent"})
            }
            else {
                receivingUser.requests.push(userID)
                receivingUser.save()
                res.status(200).json({message: "Friend request sent successfully"})
            }
        }
        else {
            res.status(404).json({errorMessage: "User could not be found"})
        }


    } catch (err) {
        console.log(err)
        res.status(500).json({errorMessage: "Internal server error"})
    }
}

module.exports.getFriendRequests = async (req, res) => {
    console.log("request received")
    try {
        const {userID} = req.params
        const user = await User.findById(userID, 'requests').populate('requests')

        if (user) {
            let requests = user.requests
            requests = requests.map((request) => ({
                username: request.username,
                //TODO: profile picture
            }))
            res.status(200).json({requests})
        }
        else {
            res.status(404).json({errorMessage: "User could not be found"})
        }


    } catch (err) {
        console.log(err)
        res.status(500).json({errorMessage: "Internal server error"})
    }
}

module.exports.getFriends = async (req, res) => {
    try {
        const {userID} = req.params
        const user = await User.findById(userID, 'friends').populate('friends')

        if (user) {
            let friends = user.friends
            friends = friends.map((friend) => ({
                username: friend.username
                //TODO: profile picture
            }))
            res.status(200).json({friends})
        }
        else {
            res.status(404).json({errorMessage: "User could not be found"})
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({errorMessage: "Internal server error"})
    }
}

module.exports.acceptFriendRequest = async (req, res) => {
    console.log("request received")
    try {
        const {reqUsername} = req.body
        const {userID} = req.params

        //update the user that sent the friend request
        let user = await User.findOne({username: reqUsername})
        let friends = user.friends
        friends.push(userID)
        await user.save()

        //update the user that received the friend request
        user = await User.findById(userID).populate('requests friends')
        let friendRequests = user.requests
        friends = user.friends
        for (let i = 0; i < friendRequests.length; i++) {
            if (friendRequests[i].username === reqUsername) {
                friends.push(friendRequests[i]._id)
                friendRequests.splice(i, 1)
            }
        }
        await user.save()

        user = await User.findById(userID).populate('friends requests')
        friendRequests = user.requests
        friends = user.friends
        friendRequests = friendRequests.map((user) => ({
            username: user.username
            //TODO: profile picture
        }))

        friends = friends.map((user) => ({
            username: user.username
            //TODO: profile picture
        }))


        console.log("200 returned")
        console.log(friendRequests.length)
        res.status(200).json({friends, friendRequests})
    } catch (err) {
        console.log(err)
        res.status(500).json({errorMessage: "Internal server error"})
    }
}

module.exports.denyFriendRequest = async (req, res) => {

}