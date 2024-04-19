/*
 * ProfileSettings.js
 *
 * This controller manages profile settings, allowing users to update their profile
 * information, including changing their password, name, and bio.
 *
 * Functionalities:
 * - ChangePassword: Allows a user to change their password.
 * - ChangeName: Allows users to update their display name.
 * - ChangeBio: Allows users to modify their biography.
 * - DeleteAccount: Provides users with the option to delete their account.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {User, Session} = require("../../Models/User");
const Group = require('../../Models/Group');
const {compare} = require("bcrypt");
const {ref, deleteObject} = require("firebase/storage");
const storage = require("../../Firebase/Firebase");
const {sendFriendUpdate} = require("../../ServerSocketControllers/FriendsSocket");
const {Post, Comment} = require("../../Models/Post");
const {leave} = require("../Groups/GroupActionsController");
const {deleteImageFirebaseUrl} = require("../../Firebase/FirebaseOperations");
const Prompt = require("../../Models/Prompt");
const Achievement = require('../../Models/Achievement')


/**
 * Handle user change password.
 * /user/:userid/profile/changepassword
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changePassword = async (req, res) => {
    try {
        const {userID} = req.params;
        const {newPassword} = req.body;

        if (newPassword === '') {
            return res.status(400).json({errorMessage: "Invalid password length. Max (4-20 Chars)."});
        }
        if (newPassword.length < 4 || newPassword.length > 20) {
            return res.status(400).json({errorMessage: "Invalid password length. Max (4-20 Chars)."});
        }


        const user = await User.findById(userID); //find user
        if (user) {
            // Compares password given by client and decrypted password stored in MongoDB
            const verifyPassword = await compare(newPassword, user.password);
            if (verifyPassword) {
                return res.status(401).json({errorMessage: "The new password should be different."});
            }
            user.password = newPassword;
            await user.save();
            res.status(200).json({passChanged: true});
        } else {
            return res.status(404).json({errorMessage: "User could not be found."});
        }
    } catch (error) {
        console.log("changePassword module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * Handle user change name.
 * /user/:userid/profile/changename
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changeName = async (req, res) => {
    try {
        const {userID} = req.params;
        const {newName} = req.body;

        if (newName === '') { //Empty field
            res.status(400).json({errorMessage: "Field empty."});
        }

        if (newName.length < 2 || newName.length > 10) { //invalid name length
            return res.status(400).json({
                errorMessage: "Invalid name length. Max (2-15 Chars).",
            });
        }

        const user = await User.findById(userID); //find user
        console.log(user);
        if (user) { //User found
            user.name = newName;
            await user.save();
            console.log(user);
            res.status(200).json({nameChanged: true});
        } else { //user not found
            return res.status(404).json({errorMessage: "User could not be found."});
        }

    } catch (error) { //Server error
        console.log("changeName module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * Handle user change bio.
 * /user/:userid/profile/changebio
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changeBio = async (req, res) => {
    try {
        const {userID} = req.params;
        const {newBio} = req.body;

        if (newBio === '') { //Empty field
            res.status(400).json({errorMessage: "Field empty."});
        }

        if (newBio.length > 30) { // Check length
            return res.status(400).json({errorMessage: "Invalid biography length. Max (30 Chars)."});
        }

        const user = await User.findById(userID); //Find user
        if (user) { //User not found
            if (user.biography === newBio) { //Check if it is the same bio
                return res.status(400).json({errorMessage: "The new biography should be different."});
            }
            user.biography = newBio;
            await user.save();
            res.status(200).json({bioChanged: true});
        } else { //User not found send error
            return res.status(404).json({errorMessage: "User could not be found."});
        }

    } catch (error) { //Server error
        console.log("changeBio module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * Handle user delete Account.
 * /user/:userid/profile/delete
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.deleteAccount = async (req, res) => {
    try {
        const {userID} = req.params;
        const user = await User.findById(userID).populate({
            path: 'groups',
            populate: [
                {
                    path: 'adminUserID',
                },
                {
                    path: 'userList',
                    populate: [
                        {
                            path: 'user',
                        }]
                }
                ]}); //Find user
        //console.log(user);
        if (user) {
            //Delete Friends/Reqs/remove blocks (fix remove blocks later) (Done with friends)
            //Fix delete WeeklyDaily (Done)
            //Delete Groups (Using leave)
            //Delete Delete user information
            //Delete mongodb

            if (user.profilePicture !== '') {
                await deleteImageFirebaseUrl(user.profilePicture);
            }


            //deleting user from other people's friends
            await user.populate('friends');

            let friends = user.friends;
            if (friends && friends.length > 0) {
                for (let i = 0; i < friends.length; i++) {
                    friends[i].friends = friends[i].friends.filter(userGroup => userGroup.toString() !== userID);
                    await friends[i].save();
                    let friendList = [];
                    await friends[i].populate('friends');
                    if (friends[i].friends.length > 0) {
                        friendList = friends[i].friends.map(userFriend => ({
                            username: userFriend.username,
                        }));
                    }
                    sendFriendUpdate(friends[i]._id.toString(), friendList);
                }
            }

            let groups = user.groups;
            if (groups && groups.length > 0) {
                for (const group of groups) {
                    console.log(group);
                    if (group.userList.length > 1) {
                        if (group.adminUserID._id.toString() === user._id.toString()) {
                            // set to any random person in the group
                            console.log(group.userList);
                            const newAdmin = group.userList.find(userL => userL.user._id.toString() !== user._id.toString());
                            console.log(newAdmin);
                            if (newAdmin === null) {
                                for (const prompt of group.prompts) {
                                    await Prompt.findByIdAndDelete(prompt._id.toString());
                                }
                                await Group.findByIdAndDelete(group._id);
                                continue;
                            }
                            group.adminUserID = newAdmin.user;
                            group.adminName = group.adminUserID.username;
                            console.log(group);
                            await group.save();
                        }
                    }
                    let leaveSuccess = await leave(user._id.toString(), group._id.toString());
                    if (!leaveSuccess) {
                        console.log("deleteGroup module: 500 error");
                        res.status(500).json({errorMessage: "Something went wrong..."});
                    }
                    if (group.userList.length <= 1) {
                        for (const prompt of group.prompts) {
                            await Prompt.findByIdAndDelete(prompt._id.toString());
                        }
                        await Group.findByIdAndDelete(group._id);
                        console.log("Group deleted")
                    }
                }
            }


            //deleting user
            await Achievement.findOneAndDelete({user: user._id.toString()});
            await User.findByIdAndDelete(user._id.toString());
            const session = await Session.findOne({userID: userID}); //Find session
            await Session.findByIdAndDelete(session._id.toString());
            res.status(200).json({isDeleted: true});
        } else { //User not found
            res.status(404).json({errorMessage: "Something went wrong..."});
        }
    } catch (error) {
        console.log("deleteAccount module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}