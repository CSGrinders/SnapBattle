const {User} = require("../../Models/User")


//TODO: TESTING
module.exports.inviteToGroup = async(req, res)=> {
    try {
        console.log(req.body)
        console.log(req.params)
        const {userID, groupID} = req.params
        const {inviteUsername} = req.body

        //user that sent the request
        const user = await User.findById(userID).populate('friends')

        //group for invitation
        const group = await Group.findByID(groupID)
        if (!group) {
            return res.status(404).json({errorMessage: "Group could not be found"})
        }

        //array of user objects
        const friends = user.friends
        if (!friends) {
            return res.status(404).json({errorMessage: "Friends could not be found"})
        }

        //iterate through friends to see if any have matching username as inviteUsername
        let found = false
        for (let i = 0; i < friends.length; i++) {
            if (friends[i].username === inviteUsername) {
                //found friend to invite
                found = true

                //add group to the friend's group invites
                friends[i].invites.push(groupID)
                await friends[i].save()

                return res.status(200).json("Group invite sent successfully!")
            }
        }

        //friend with matching username not found
        if (!found) {
            return res.status(404).json({errorMessage: "Username not found or user is not your friend"})
        }
    } catch {
        return res.status(500).json({errorMessage: "Internal Server Error"})
    }

}