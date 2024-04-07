/*
 * GroupActionsController.js
 *
 * This controller manages group-related actions.
 *
 * Functionalities:
 * - GetGroups: Lists all groups a user is a member of, including group ID and name.
 * - CreateGroup: Allows a user to create a new group with specified fields such as group name, maximum users,
 *   start and end time for the group's activity, and voting period.
 * - ListUsers: Provides a list of all users within a specified group, helping group management and interaction.
 * - AcceptGroupInvite: Accepts an existing invite to a group
 * - RejectGroupInvite: Rejects an existing invite to a group
 * - LeaveGroup: Allows a user to leave a group they are in
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const Group = require('../../Models/Group');
const {User} = require("../../Models/User");
const Prompt = require("../../Models/Prompt");
const {Post, Comment} = require("../../Models/Post");

const {getPhoto} = require("../Profile/ProfileController");
const {
    ref,
    getDownloadURL
} = require("firebase/storage");
const storage = require("../../Firebase/Firebase");
const {kickUpdateStatus} = require("../../ServerSocketControllers/GroupHomeSocket");
const {sendGroups} = require("../../ServerSocketControllers/GroupMainSocket");
const {signOut} = require("../Auth/AuthController");
const {deleteImageFirebaseUrl} = require("../../Firebase/FirebaseOperations");
/**
 * desc
 * /user/:userID/groups/
 *
 * @params userID
 *
 */

module.exports.getGroups = async(req, res)=> {
    try {
        const {userID} = req.params;

        //get user's groups as an array of {_id, name}
        //get user's group invites as an array of {_id, name}
        const user = await User.findById(userID)
            .populate('groups', 'name adminName')
            .populate('invites', 'name');
        if (user) {
            let username = user.username;
            let groups = user.groups;
            groups = groups.map((group) => ({groupID: group._id.toString(), name: group.name, adminName: group.adminName}));
            let invites = user.invites
            invites = invites.map((group) => ({groupID: group._id.toString(), name: group.name}))
            res.status(200).json({username, invites, groups});
        }
        else {
            res.status(404).json({errorMessage: "Groups or group invites could not be found."});
        }
    }
    catch (error) {
        console.log("getGroups module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 *  Creates a group
 *  /user/:userID/groups/create
 *
 *  @params username, groupName, maxUsers,
 *          timeStart, timeEnd, timeToVote,
 *
 */

module.exports.createGroup = async(req, res) => {
    try {
        const userID = req.body.userID;
        const groupName = req.body.groupName;
        const maxUsers = req.body.maxUsers;
        const timeStart = req.body.timeStart;
        const timeEnd = req.body.timeEnd;
        const timeToVote = req.body.timeToVote;

        const user = await User.findById(userID);

        if (user) {
            let newHr = parseInt(timeStart.substring(0, 2));
            let subHr = parseInt(timeEnd.substring(0,2));
            let newMin = parseInt(timeStart.substring(3));
            let subMin = parseInt(timeEnd.substring(3));
            if (newHr > subHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
            } else if (newHr === subHr) {
                if (newMin > subMin) {
                    return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
                }
            }

            let hrsUsed = subHr - newHr;
            let minUsed = subMin - newMin + (hrsUsed * 60);
            let minAvail = 60 * 24 - minUsed;

            let lengthHr = parseInt(timeToVote.substring(0,2));
            let lengthMin = (parseInt(timeToVote.substring(3)) + (lengthHr * 60)) * 2;

            if (minAvail < lengthMin) {
                return res.status(402).json({errorMessage: "Not enough time to do weekly and daily votes!"});
            }

            const userList = [{
                user: user._id,
                points: 0
            }];
    
            const prompts = [];

            //weekly voting day should be the "day of the week" that corresponds to yesterday
            let day = new Date().getDay() - 1
            if (day === -1) {
                day = 6
            }

    
            const newGroup = new Group({
                name: groupName,
                maxUsers: maxUsers,
                timeStart: timeStart,
                timeEnd: timeEnd,
                userList: userList,
                adminName: user.username,
                adminUserID: user._id,
                timeToVote: timeToVote,
                prompts: prompts,
                weeklyVotingDay: day
            });

            console.log("createGroups module: New group created! " + newGroup);
    
            await newGroup.save();

            user.groups.push(newGroup._id);
            await user.save();

            let groupInfo =  {
                groupID: newGroup._id.toString(),
                name: newGroup.name,
            };

            sendGroups(userID, groupInfo);
            res.status(200).json({groupCreated: true});
        } else {
            res.status(404).json({errorMessage: "User not found."});
        }
    } catch (error) {
        console.log("createGroups module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * desc
 * /user/:userID/groups/list-users/:groupID
 *
 *  @params userID, groupID
 *
 **/

module.exports.listUsers = async(req, res) => {
    try {
        const {groupID, userID} = req.params;
        const group = await Group.findById(groupID).populate({
            path: 'userList.user',
            select: '_id username profilePicture name'
        }).populate({
            path: 'adminUserID',
            select: '_id'
        });

        const isUserInGroup = group.userList.some(user => user.user._id.toString() === userID);
        if (!isUserInGroup) {
            return res.status(404).json({errorMessage: 'User don\'t belong to this group.'});
        }

        if (group) {
            const userList = group.userList.map(list => ({
                _id: list.user._id,
                name: list.user.name,
                username: list.user.username,
                profilePicture: list.user.profilePicture,
            }));
            return res.status(200).json({list: userList, adminUser: group.adminUserID._id})
        } else {
            return res.status(404).json({errorMessage: "Group could not be found."})
        }
    } catch (error) {
        console.log("listUsers module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.acceptGroupInvite = async(req, res, next) => {
    try {
        const {userID, groupID} = req.params;
        const user = await User.findById(userID);
        const group = await Group.findById(groupID);

        if (!group) {
            return res.status(404).json({errorMessage: "Group could not be found."});
        }

        //add user to group
        if (group.userList.length < group.maxUsers) {
            group.userList.push({ user: userID, points: 0 });
            await group.save();
        }
        else {
            console.log("acceptGroupsInvite module: group has max number of users")
            return res.status(404).json({errorMessage: "You cannot join because the group has the max number of users"})
        }

        //add group to user's groups and remove group from user's group invites
        user.groups.push(groupID);
        user.invites = user.invites.filter(invite => invite._id.toString() !== groupID);
        await user.save();
        //get user's new groups and group invites and send back to client
        next();

    } catch (error) {
        console.log("acceptGroupsInvite module: " + error);
        return res.status(500).json({errorMessage: "idk hee hee"})
    }
}

module.exports.rejectGroupInvite = async(req, res, next) => {
    try {
        const {userID, groupID} = req.params
        const user = await User.findById(userID)

        //remove group from user's group invites
        user.invites = user.invites.filter(invite => invite._id.toString() !== groupID);
        await user.save();

        next()

    } catch (error) {
        console.log("rejectGroupsInvite module: " + error);
        return res.status(500).json({errorMessage: "idk hee hee 2"})
    }
}
/**
 * desc
 * /user/:userID/groups/:groupID/leave-group
 *
 *  @params userID, groupID
 *
 **/

module.exports.leaveGroup = async(req, res, next) => {
    try {
        const groupID = req.params.groupID;
        const userID = req.params.userID;

        const user = await User.findById(userID);
        const group = await Group.findById(groupID);

        // Check if user exists
        if (!user) {
            console.log("leaveGroup module: user not found");
            return res.status(404).json({errorMessage: "User not found"});
        }

        // Check if group exists
        if (!group) {
            console.log("leaveGroup module: Group not found");
            return res.status(404).json({errorMessage: "Group could not be found."});
        }

        // Check if group is in user's group
        if (!user.groups.some(groupId => groupId.toString() === groupID)) {
            //console.log(user.groups)
            console.log("leaveGroup module: group not in user's groups");
            return res.status(404).json({errorMessage: "You don't belong to this group."});
        }

        let leaveSuccess = await leave(userID, groupID);
        if (!leaveSuccess) {
            return res.status(500).json({errorMessage: "Something went wrong..."});
        }

        // for some reason doesn't update on time;
        if (group.userList.length <= 1) {
            for (const prompt of group.prompts) {
                await Prompt.findByIdAndDelete(prompt._id.toString());
            }
            await Group.findByIdAndDelete(group._id);
            console.log("Group deleted")
        }

        next();

    } catch (error) {
        console.log("leaveGroup module " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

async function leave(userID, groupID){
    try {
        const user = await User.findById(userID);
        const group = await Group.findById(groupID).populate(
            {
            path: 'messages',
            populate: {
                path: 'user',
                select: '_id name avatar'
            }
        });

        if (!group) {
            return false;
        }


        // delete posts from user
        for (let i = 0; i < group.prompts.length; i++) {
            const prompt = await Prompt.findById(group.prompts[i]).populate('posts').populate('dailyWinnerID', '_id')
            if (prompt.dailyWinnerID && prompt.dailyWinnerID._id === userID) {
                prompt.dailyWinnerID = null;
                await prompt.save();
            }
            for (let j = 0; j < prompt.posts.length; j++) {
                // delete comments of that user
                const post = await Post.findById(prompt.posts[j]).populate('_id comments picture').populate('owner', '_id');
                // don't bother going through comments if there are no comments
                for (let k = 0; k < post.comments.length; k++) {
                    const comment = await Comment.findById(post.comments[k]);
                    // comment could be "null" if it was a reply and alr got booted
                    if (comment !== null) {
                        if (comment.userID.toString() === user._id.toString()) {
                            await deleteComment(comment._id);
                        }
                    }
                }
                if (post.owner._id.toString().trim() === userID) {
                    await deleteImageFirebaseUrl(post.picture);
                    await Post.findByIdAndDelete(post._id);
                    continue;
                }
                post.comments = post.comments.filter((comment) => comment.userID.toString() !== userID.toString())
                await post.save();

            }
            prompt.posts = prompt.posts.filter((post) => post.owner.toString() !== userID.toString())
            await prompt.save();
        }

        // Remove group from user's group list
        user.groups = await user.groups.filter((groupID) => groupID.toString() !== group._id.toString());
        await user.save();

        for (let j = 0; j < group.messages.length; j++) {
            let message = group.messages[j];
            if (message.user._id === user._id.toString()) {
                message.user.avatar = 'https://firebasestorage.googleapis.com/v0/b/snapbattle-firebase.appspot.com/o/default-profile-picture.webp?alt=media&token=9e817ce9-4a9a-40f0-9267-696eb4791f80';
            }
        }

        // Remove user from group's user list
        group.userList = await group.userList.filter((id) => id.user._id.toString() !== user._id.toString());
        await group.save();
        return true;
    } catch (e) {
        console.log("leave function: leaving group failed " + e)
        return false;
    }
}

async function deleteComment(commentID) {
    // find comment
    const comment = await Comment.findById(commentID).populate('replyBy').populate('replyTo', '_id');
    // if comment does not have any replies
    if (comment.replyBy.length !== 0) { // if original comment has replies
        // delete all replies to that comment
        for (let i = 0; i < comment.replyBy.length; i++) {
            await deleteComment(comment.replyBy[i]);
        }
    }
    // if comment is a reply to another comment, edit parent comment's replyBy
    if (comment.replyTo !== null) {
        const parent = await Comment.findById(comment.replyTo._id.toString()).populate('replyBy');
        parent.replyBy = parent.replyBy.filter((reply) => reply._id.toString() !== comment._id.toString())
        await parent.save();
    }
    // delete comment
    await Comment.findByIdAndDelete(comment._id.toString());
}

/**
 * desc
 * /user/:userID/groups/:groupID/delete-group
 *
 *  @params groupID
 *
 **/

module.exports.deleteGroup = async(req, res) => {
    try {
        const groupID = req.params.groupID;
        const userID = req.params.userID

        // Find group
        const group = await Group.findById(groupID).populate('userList.user', '_id groups name').populate('prompts', '_id');
        if (group) {
            const groupId = group._id.toString();
            if (group.adminUserID.toString() !== userID) {
                return res.status(404).json({errorMessage: "You are not an admin user"})
            }

            // Iterate through users in groups and delete group from user
            for (const user of group.userList) {
                let leaveSuccess = await leave(user.user._id.toString(), group._id.toString());
                if (!leaveSuccess) {
                    console.log("deleteGroup module: 500 error");
                    res.status(500).json({errorMessage: "Something went wrong..."});
                }

                user.user.groups = user.user.groups.filter((groupID) => groupID.toString() !== groupId);
                await user.user.save();
                let result = await User.aggregate([
                    {
                        $match: {_id: user.user._id}
                    },
                    {
                        $lookup: {
                            from: "groups",
                            localField: "groups",
                            foreignField: "_id",
                            as: "groupDetails"
                        }
                    },
                    {
                        $project: {
                            groupInfo: {
                                $map: {
                                    input: "$groupDetails",
                                    as: "group",
                                    in: {
                                        groupID: "$$group._id",
                                        name: "$$group.name",
                                        adminName: '$$group.adminName',
                                    }
                                }
                            }
                        }
                    }
                ]);
                if (result !== null && result.length > 0) {
                    let groupsInfo = [];
                    result[0].groupInfo.forEach(group => {
                        groupsInfo.push({
                            groupID: group.groupID.toString(),
                            name: group.name,
                            adminName: group.adminName,
                        });
                    });
                    sendGroups(user.user._id.toString(), { groups: groupsInfo })
                } else {
                    sendGroups(user.user._id.toString(), {groups: null});
                }
            }
            for (const prompt of group.prompts) {
                await Prompt.findByIdAndDelete(prompt._id.toString());
            }
            await Group.findByIdAndDelete(group._id);
            res.status(200).json({groupDeleted: true});
        } else {
            console.log("deleteGroup module: Group not found");
            res.status(404).json({errorMessage: "Group could not be found."});
        }
    } catch (error) {
        console.log("deleteGroup module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * get the profile page of a person in a group w you
 * /user/:userID/groups/:groupID/visit-member-profile
 *
 *  @params userID, searchID
 *
 **/
module.exports.visitFriendProfile = async (req, res) => {
    try {
        const {userID} = req.params
        const {searchID} = req.body;
        const searchUser = await User.findById(searchID)
        if (searchUser) {
            if (searchUser._id.toString() === userID) {
                return res.status(202).json({message: "self"})
            }

            //check if searched user is already a friend -> display profile without add friend button using viewType = 1
            for (let i = 0; i < searchUser.friends.length; i++) {
                if (searchUser.friends[i]._id.toString() === userID) {
                    return res.status(200).json({
                        searchName: searchUser.name,
                        searchUsername: searchUser.username,
                        searchBio: searchUser.biography,
                        searchID: searchUser._id.toString(),
                        searchPFP: searchUser.profilePicture,
                        viewType: 0
                    });
                }
            }

            // check if searched user has already been sent a friend request -> viewType = 2
            for (let i = 0; i < searchUser.requests.length; i++) {
                if (searchUser.friends[i]._id.toString() === userID) {
                    return res.status(200).json({
                        searchName: searchUser.name,
                        searchUsername: searchUser.username,
                        searchBio: searchUser.biography,
                        searchID: searchUser._id.toString(),
                        searchPFP: searchUser.profilePicture,
                        viewType: 2
                    });
                }
            }
            return res.status(200).json({
                searchName: searchUser.name,
                searchUsername: searchUser.username,
                searchBio: searchUser.biography,
                searchID: searchUser._id.toString(),
                searchPFP: searchUser.profilePicture,
                viewType: 1
            });
        } else {
            return res.status(404).json({errorMessage: "User could not be found."});
        }
    } catch (error) {
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * check if user is admin when leaving a group
 * /user/:userID/groups/:groupID/check-admin
 *
 *  @params userID, groupID
 **/
module.exports.checkAdmin = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() === userID && group.userList.length > 1) {
                return res.status(200).json({admin: true})
            }
            else {
                return res.status(200).json({admin: false})
            }
        } else {
            return res.status(404).json({errorMessage: "Group could not be found."})
        }
    } catch (e) {
        return res.status(500).json({errorMessage: "Something went wrong..."})
    }
}

/**
 * check if user is admin when leaving a group
 * /user/:userID/groups/:groupID/transfer-admin
 *
 *  @params userID, groupID, newAdminUsername
 **/
module.exports.transferAdmin = async (req, res) => {
    try {
        const {userID, groupID} = req.params;
        const newAdminUsername = req.body.newAdminUsername;
        const newAdminUser = await User.findOne({username: newAdminUsername})
        const group = await Group.findById(groupID);
        if (!group) {
            return res.status(404).json({errorMessage: 'Group could not be found.'})
        }
        if (newAdminUser) {
            // check that user did not input themselves
            if (newAdminUser._id === userID) {
                return res.status(400).json({errorMessage: "You cannot select yourself!"})
            }
            // set new admin if admin is a valid user of group
            const isUserInGroup = group.userList.some(list => list.user.toString() === newAdminUser._id.toString());

            if (isUserInGroup) {
                group.adminUserID = newAdminUser._id;
                group.adminName = newAdminUser.username; // Assuming adminName still needs to be updated
                await group.save();
                return res.status(200).json({ adminChange: true });
            } else {
                return res.status(404).json({ errorMessage: "User does not exist in this group" });
            }
            return res.status(404).json({errorMessage: "User does not exist in this group"})
        } else {
            return res.status(404).json({errorMessage: "User does not exist"})
        }
    } catch (e) {
        return res.status(500).json({errorMessage: "Something went wrong..."})
    }
}

/**
 * kick user from group
 * /user/:userID/groups/:groupID/kick-user
 *
 *  @params userID, groupID, kickUsername
 **/
module.exports.kickUser = async (req, res) => {
    try {
        const {userID, groupID} = req.params;
        const group = await Group.findById(groupID).populate("userList.user", '_id');
        if (!group) {
            return res.status(404).json({errorMessage: "Group could not be found."});
        }
        console.log(group)
        const {kickUsername} = req.body;
        const kickUser = await User.findOne({username: kickUsername});
        const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
        if (!isUserInGroup) {
            return res.status(404).json({errorMessage: 'User don\'t belong to this group.'});
        }
        if (kickUser) {
            // check if user is admin user
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"});
            }

            // Check if group is in user's group
            for (let i = 0; i < kickUser.groups.length; i++) {
                if (kickUser.groups[i]._id.toString() === groupID) {

                    let kickSuccess = await leave(kickUser._id, groupID);

                    if (!kickSuccess) {
                        return res.status(500).json({errorMessage: "Something went wrong..."})
                    }

                    kickUpdateStatus(kickUser._id.toString(), userID, groupID);
                    return res.status(200).json({userKicked: true});
                }
            }
            return res.status(404).json({errorMessage: "User is not a part of this group."});
        } else {
            return res.status(404).json({errorMessage: 'User is not a part of this group.'});
        }
    } catch (error) {
        console.log("kickUser module: " + error);
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
module.exports.leaveAllGroups = async(req, res) => {
    try {
        const userID = req.params.userID;
        const {blockUsername} = req.body;

        const blockUser = await User.findOne({username: blockUsername})
        if (!blockUser) {
            return res.status(404).json({errorMessage: "User you are trying to block is not found.", viewType: 0})
        }

        const user = await User.findById(userID).populate([
            {
                path: 'groups',
                populate: [
                    {
                        path: 'userList.user',
                        select: '_id username'
                    },
                    {
                        path: 'adminUserID',
                        select: '_id username'
                    }
                ]
            }
        ]);
        if (!user) {
            console.log("leaveAllGroups module: 500 error");
            return res.status(500).json({errorMessage: "Something went wrong..."});
        }

        for (let i = 0; i < user.groups.length; i++) {
            // go through each group
            const group = user.groups[i];
            if (!group) {
                continue;
            }

            // if user that you are blocking is found in group
            const isUserBlock = group.userList.some(userL => userL.user._id.toString() === blockUser._id.toString());

            if (isUserBlock) {
                // if you are leaving a group you are admin in
                if (group.adminUserID._id.toString() === user._id.toString()) {
                    // set to any random person in the group
                    group.adminUserID = group.userList.find(userL => userL.user._id.toString() !== user._id.toString());
                    group.adminName = group.adminUserID.username;
                    await group.save();
                }

                let leaveSuccess = await leave(userID, group._id.toString());
                if (!leaveSuccess) {
                    console.log("leaveAllGroups module: 500 error");
                    return res.status(500).json({errorMessage: "Something went wrong..."});
                }
            }
        }

        await user.save();
        return res.status(200).json({success: true})

    } catch (error) {
        console.log("leaveAllGroups module " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


