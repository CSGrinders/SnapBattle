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
const Group = require("../../Models/Group");
const { sendGroupInvites } = require('../../ServerSocketControllers/GroupMainSocket');


/**
 * Add small desc.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.inviteToGroup = async(req, res)=> {
    try {
        const {userID, groupID} = req.params;
        const {inviteUsername} = req.body;
        //user that sent the request
        const user = await User.findById(userID).populate('friends');

        //group for invitation
        const group = await Group.findById(groupID);
        if (!group) {
            return res.status(404).json({errorMessage: "Group could not be found."});
        }

        if(group.userList.length === group.maxUsers) {
            return res.status(404).json({errorMessage: "The group has the max number of users"})
        }

        //array of user objects
        const friends = user.friends;
        if (!friends) {
            return res.status(404).json({errorMessage: "Friends could not be found."});
        }

        //iterate through friends to see if any have matching username as inviteUsername
        let found = false;
        let inviteFriend = null
        for (let i = 0; i < friends.length; i++) {
            if (friends[i].username === inviteUsername) {
                //found friend to invite
                found = true;
                inviteFriend = friends[i]
                break
            }
        }

        //friend with matching username not found
        if (!found) {
            return res.status(404).json({errorMessage: "Username not found or user is not your friend."});
        }

        //ensure that the friend to invite does not already have an invite from the group
        for (let i = 0; i < inviteFriend.invites.length; i++) {
            if (inviteFriend.invites[i]._id.toString() === groupID) {
                return res.status(404).json({errorMessage: "You have already sent a request to this user"});
            }
        }

        //ensure that the friend is not already in the group
        for (let i = 0; i < group.userList.length; i++) {
            if (group.userList[i]._id.toString() === inviteFriend._id.toString()) {
                return res.status(404).json({errorMessage: "This friend is already in the group"})
            }
        }

        //add group to the friend's group invites
        inviteFriend.invites.push(groupID);
        await inviteFriend.save();
        await inviteFriend.populate('invites', 'name');

        let invites = inviteFriend.invites.map(invite => ({
            groupID: invite._id.toString(),
            name: invite.name
        }));
        sendGroupInvites(inviteFriend._id.toString(), { groupInvites: invites });
        return res.status(200).json({message: "Group invite sent successfully!"});

    } catch (error) {
        console.log("inviteToGroup module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }

}