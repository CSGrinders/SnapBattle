const {User} = require("../../Models/User")

module.exports.inviteToGroup = async(req, res)=> {
    console.log(req.body)
    console.log(req.params)
    console.log(req.url)
    const userID = req.params.userID;
    const groupID = req.params.groupID;
    const {inviteUsername} = req.body

    //user that sent the request
    const user = await User.findById(userID).populate('friends')

    //array of user objects
    const friends = user.friends
    console.log(friends)

    //iterate through friends to see if any have matching username as inviteUsername
    let found = false
    for (let i = 0; i < friends.length; i++) {
        if (friends[i].username === inviteUsername) {
            //found friend to invite
            found = true

            //TODO:add group to the friend's group invites

            return res.status(200).json("Group invite sent successfully!")

        }
    }

    if (!found) {
        console.log('error')
        return res.status(409).json("Username not found or user is not your friend")
    }
}