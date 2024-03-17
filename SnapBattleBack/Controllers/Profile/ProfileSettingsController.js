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


/**
 * Handle user change password.
 * /user/:userid/profile/changepassword
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changePassword = async(req, res)=> {
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
            res.status(500).json({
                errorMessage: "Something went wrong...",
            });
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

module.exports.changeName = async(req, res)=> {
    try {
        const { userID } = req.params;
        const { newName } = req.body;

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
            res.status(404).json({errorMessage: "Something went wrong..."});
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

module.exports.changeBio = async(req, res)=> {
    try {
        const { userID } = req.params;
        const { newBio } = req.body;

        if (newBio === '') { //Empty field
            res.status(400).json({errorMessage: "Field empty."});
        }

        if (newBio.length > 30) { // Check length
            return res.status(400).json({errorMessage: "Invalid biography length. Max (30 Chars)."});
        }

        const user = await  User.findById(userID); //Find user
        if (user) { //User not found
            if (user.biography === newBio) { //Check if it is the same bio
                return res.status(400).json({errorMessage: "The new biography should be different."});
            }
            user.biography = newBio;
            await user.save();
            res.status(200).json({bioChanged: true});
        } else { //User not found send error
            res.status(404).json({errorMessage: "Something went wrong..."});
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

module.exports.deleteAccount = async(req, res)=> {
    try {
        const { userID } = req.params;
        const user = await User.findById(userID); //Find user
        if (user) {

            //deleting profile picture
            const imageRef = ref(storage, `profileImage/${userID}.jpeg`);
            try {
                await deleteObject(imageRef);
            } catch (error) {
                console.log("this user does not have profile image");
            }

            //nested-populate to find all user's groups, containing all prompts, posts, and comments
            await user.populate({path: 'groups', populate: {path: 'prompts', populate: {path: 'posts', populate: 'comments'}}});
            let groups = user.groups;
            if (groups) {
                for (let i = 0; i < groups.length; i++) {
                    let group = groups[i]

                    //deleting all posts and comments associated w/ user
                    for (let j = 0; j < group.prompts.length; j++) {
                        let prompt = group.prompts[j]
                        for (let k = 0; k < prompt.posts.length; k++) {
                            let post = prompt.posts[k]

                            //post is owned by user -> delete both post and all of its comments
                            if (post.owner.toString() === userID) {

                                //deleting from firebase //TODO: consider what to do if daily or weekly winner
                                const postRef = ref(storage, post.picture)
                                await deleteObject(postRef)

                                //deleting from mongoDB
                                await Comment.deleteMany({postID: post._id.toString()})
                                await Post.findByIdAndDelete(post._id.toString())
                            }

                            //TODO: post has comment by user -> alter comment to show that it is from deleted account
                        }
                    }


                    //removes user from group's user list
                    group.userList = group.userList.filter(userGroup => userGroup.toString() !== userID);
                    if (group.adminUserID.toString() === userID && group.userList.length > 0) {
                        group.adminUserID = group.userList[0];
                        console.log(`New admin selected for group ${group._id}: ${group.adminUserID}`);
                    }
                    if (group.userList.length > 0) {
                        await group.save();
                    } else {
                        //TODO: delete all referenced documents of the group (prompts, posts, comments, etc.)
                        await Group.findByIdAndDelete(group._id.toString());
                    }
                }
            }

            //deleting user from other people's frineds
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

            //deleting user
            await User.findByIdAndDelete(user._id.toString());
            const session = await Session.findOne({ userID: userID}); //Find session
            await session.deleteOne(session);
            res.status(200).json({isDeleted: true});
        } else { //User not found
            res.status(404).json({errorMessage: "Something went wrong..."});
        }
    } catch (error) {
        console.log("deleteAccount module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}