/*
 * GroupInviteController.js
 *
 * This controller handles the group invitations.
 *
 * Functionalities:
 * - InviteToGroup: Allows a user to invite one of their friends to join a specific group. The invitation is added
 * to the invitee's list of pending group invites, which they can accept or deny.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {User} = require("../../Models/User");
const {Group} = require("../../Models/Group");


/**
 * Add small desc.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

//TODO: TESTING
module.exports.inviteToGroup = async(req, res)=> {
    try {
        const {userID, groupID} = req.params;
        const {inviteUsername} = req.body;
        console.log(userID);
        console.log(inviteUsername)
        //user that sent the request
        const user = await User.findById(userID).populate('friends');
        console.log(userID);

        //group for invitation
        const group = await Group.findById(groupID);
        if (!group) {
            return res.status(404).json({errorMessage: "Group could not be found."});
        }

        //array of user objects
        const friends = user.friends;
        if (!friends) {
            return res.status(404).json({errorMessage: "Friends could not be found."});
        }

        //iterate through friends to see if any have matching username as inviteUsername
        let found = false;
        for (let i = 0; i < friends.length; i++) {
            if (friends[i].username === inviteUsername) {
                //found friend to invite
                found = true;

                //add group to the friend's group invites
                friends[i].invites.push(groupID);
                await friends[i].save();

                return res.status(200).json({message: "Group invite sent successfully!"});
            }
        }

        //friend with matching username not found
        if (!found) {
            return res.status(404).json({errorMessage: "Username not found or user is not your friend."});
        }
    } catch (error) {
        console.log("inviteToGroup module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }

}