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
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const Group = require('../../Models/Group');
const {User} = require("../../Models/User");

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
        const findGroups = await User.findById(userID, 'groups -_id').populate('groups', 'name');
        if (findGroups) {
            let groups = findGroups.groups;
            groups = groups.map((group) => ({groupID: group._id.toString(), name: group.name}));
            res.status(200).json(groups);
        }
        else {
            res.status(404).json({errorMessage: "Groups could not be found."});
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
 * /user/:userID/groups/:groupID
 *
 *  @params userID, groupID
 *
 **/

module.exports.listUsers = async(req, res) => {
    try {
        const groupID = req.params.groupID;
        const group = await Group.findById(groupID).populate('userList');

        if (group) {
            console.log("listUsers module: " + group.userList);
            res.status(200).json({list: group.userList})
        } else {
            res.status(404).json({errorMessage: "Group not found."})
        }
    } catch (error) {
        console.log("listUsers module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}