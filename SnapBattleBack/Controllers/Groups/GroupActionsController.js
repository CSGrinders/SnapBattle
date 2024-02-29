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
const {getPhoto} = require("../Profile/ProfileController");
const {
    ref,
    getDownloadURL
} = require("firebase/storage");
const storage = require("../../Firebase/Firebase");
const {sendGroups} = require("../../ServerSocketControllers/GroupSocket");

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
            .populate('groups', 'name')
            .populate('invites', 'name');
        if (user) {
            let username = user.username;
            let groups = user.groups;
            groups = groups.map((group) => ({groupID: group._id.toString(), name: group.name}));
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

            const userList = [];
            userList.push(user._id);
    
            const prompts = [];
    
            const newGroup = new Group({
                name: groupName,
                maxUsers: maxUsers,
                timeStart: timeStart,
                timeEnd: timeEnd,
                userList: userList,
                adminUserID: user._id,
                timeToVote: timeToVote,
                prompts: prompts
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
        const groupID = req.params.groupID;
        const group = await Group.findById(groupID).populate('userList');

        if (group) {
            console.log(group.userList)
            return res.status(200).json({list: group.userList, adminUser: group.adminUserID})
        } else {
            return res.status(404).json({errorMessage: "Group not found."})
        }
    } catch (error) {
        console.log("listUsers module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.acceptGroupInvite = async(req, res, next) => {
    try {
        const {userID, groupID} = req.params
        const user = await User.findById(userID)
        const group = await Group.findById(groupID)

        //add user to group
        if (group.userList.length < group.maxUsers) {
            group.userList.push(userID)
            await group.save();
        }
        else {
            console.log("acceptGroupsInvite module: group has max number of users")
            return res.status(404).json({errorMessage: "You cannot join because the group has the max number of users"})
        }

        //add group to user's groups and remove group from user's group invites
        user.groups.push(groupID)
        for (let i = 0; i < user.invites.length; i++) {
            if (user.invites[i]._id.toString() === groupID) {
                user.invites.splice(i, 1)
                break
            }
        }
        await user.save()
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
        for (let i = 0; i < user.invites.length; i++) {
            if (user.invites[i]._id.toString() === groupID) {
                user.invites.splice(i, 1)
                break
            }
        }
        await user.save()

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
            return res.status(404).json({errorMessage: "Group not found"});
        }

        // Check if group is in user's group
        let found = false
        for (let i = 0; i < user.groups.length; i++) {
            if (user.groups[i]._id.toString() === groupID) {
                found = true
            }
        }
        if (!found) {
            //console.log(user.groups)
            console.log("leaveGroup module: group not in user's groups");
            return res.status(404).json({errorMessage: "Group not in users's group"});
        }

        // Remove group from user's group list
        //console.log("before:",user.groups);
        user.groups = user.groups.filter((groupID) => groupID.toString() !== group._id.toString());
        //console.log("after:",user.groups);
        await user.save();
        

        // Remove user from group's user list
        group.userList = group.userList.filter((id) => id.toString() !== user._id.toString());
        await group.save();

        if (group.userList.length === 0) {
            await Group.findByIdAndDelete(group._id);
        }

        next();

    } catch (error) {
        console.log("leaveGroup module " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
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

        // Find group
        const group = await Group.findById(groupID).populate('userList');

        if (group) {
            const users = group.userList;
            const groupId = group._id.toString();
            await Group.deleteOne(group);
            // Iterate through users in groups and delete group from user
            for (let i = 0; i < users.length; i++) {
                users[i].groups = users[i].groups.filter((groupID) => groupID !== groupId);
                await users[i].save();
                let result = await User.aggregate([
                    {
                        $match: {_id: users[i]._id} // Make sure users[i] is correctly formatted as ObjectId
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
                                        name: "$$group.name"
                                    }
                                }
                            }
                        }
                    }
                ]);
                if (result && result.length > 0) {
                    let groupsInfo = [];
                    result[0].groupInfo.forEach(group => {
                        groupsInfo.push({
                            groupID: group.groupID.toString(),
                            name: group.name,
                        });
                    });
                    sendGroups(users[i]._id.toString(), { groups: groupsInfo })
                } else {
                    sendGroups(users[i]._id.toString(), {groups: null});
                }
            }
            res.status(200).json({groupDeleted: true});
        } else {
            console.log("deleteGroup module: Group not found");
            res.status(404).json({errorMessage: "Group not found"});
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
        console.log(group.adminUserID)
        console.log(userID)
        if (group) {
            if (group.adminUserID.toString() === userID && group.userList.length > 1) {
                return res.status(200).json({admin: true})
            }
            else {
                return res.status(200).json({admin: false})
            }
        } else {
            return res.status(404).json({errorMessage: "Group not found"})
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
        console.log(newAdminUsername)
        const newAdminUser = await User.findOne({username: newAdminUsername})
        console.log(newAdminUser)
        const group = await Group.findById(groupID);
        console.log(group)
        if (newAdminUser) {
            // check that user did not input themselves
            if (newAdminUser._id === userID) {
                return res.status(400).json({errorMessage: "You cannot select yourself!"})
            }
            // set new admin if admin is a valid user of group
            for (let i = 0; i < group.userList.length; i++) {
                if (newAdminUser._id.toString() === group.userList[i]._id.toString()) {
                    group.adminUserID = newAdminUser._id;
                    await group.save();
                    return res.status(200).json({adminChange: true});
                }
            }
            return res.status(404).json({errorMessage: "User does not exist in this group"})
        } else {
            return res.status(404).json({errorMessage: "User does not exist"})
        }
    } catch (e) {
        return res.status(500).json({errorMessage: "Something went wrong..."})
    }
}


