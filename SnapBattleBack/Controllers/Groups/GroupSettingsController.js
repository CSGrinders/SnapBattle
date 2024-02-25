/*
 * GroupSettingsController.js
 *
 * This controller manages settings for groups.
 *
 * Functionalities:
 * - editGroupName: Allows a group's administrator to change the group's name.
 * - editGroupSize: Allows the administrator to adjust the maximum number of friends in a group.
 * - editPromptTime: Allows the administrator to set the start time for group prompts.
 * - editSubmissionTime: Allows the administrator to set the deadline for submissions.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const Group = require('../../Models/Group')

/**
 * desc
 * /user/:userID/groups/:groupID/groupName
 *
 * @params groupName
 *
 */

module.exports.editGroupName = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {groupName} = req.body;
        if (groupName.length < 3 || groupName.length > 20) {
            return res.status(400).json({errorMessage: "Invalid name length! (3-20 chars)."});
        }
        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"});
            }
            group.name = groupName;
            await group.save();
            return res.status(200).json({nameChanged: true});
        }
        else {
            return res.status(404).json({errorMessage: "Group not found."});
        }
    } catch (error) {
        console.log("editGroupName module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * desc
 * /user/:userID/groups/:groupID/groupsize
 *
 * @params groupSize
 *
 */

module.exports.editGroupSize = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {groupSize} = req.body;

        if (groupSize > 51) {
            return res.status(400).json({errorMessage: "Group size must be less than 50!"});
        }
        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"});
            }
            group.maxUsers = groupSize;
            await group.save();
            return res.status(200).json({sizeChanged: true});
        }
    } catch (error) {
        console.log("editGroupSize module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * desc
 * /user/:userID/groups/:groupID/prompttime
 *
 * @params promptTime
 *
 */

module.exports.editPromptTime = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {promptTime} = req.body;
        const group = await Group.findById(groupID);
        if (group) {
            let submissionTime = group.timeEnd;
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"});
            }
            // check if prompt time isn't before submission time
            let newHr = parseInt(promptTime.substring(0, 2));
            let subHr = parseInt(submissionTime.substring(0,2));
            if (newHr > subHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
            } else if (newHr === subHr) {
                let newMin = parseInt(promptTime.substring(3));
                let subMin = parseInt(submissionTime.substring(3));
                if (newMin > subMin) {
                    return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
                }
            }
            group.timeStart = promptTime;
            await group.save();
            return res.status(200).json({promptTimeChanged: true});
        }
    } catch (error) {
        console.log("editPromptTime module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * desc
 * /user/:userID/groups/:groupID/submissiontime
 *
 * @params submissionTime
 *
 */
module.exports.editSubmissionTime = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {submissionTime} = req.body;
        const group = await Group.findById(groupID);
        if (group) {
            let promptTime = group.timeStart;
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"});
            }
            // check if prompt time isn't before submission time
            let newHr = parseInt(submissionTime.substring(0, 2));
            let startHr = parseInt(promptTime.substring(0,2));
            if (newHr < startHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
            } else if (newHr === startHr) {
                let newMin = parseInt(submissionTime.substring(3));
                let startMin = parseInt(promptTime.substring(3));
                if (newMin > startMin) {
                    return res.status(400).json({errorMessage: "Submission time cannot start before prompt time!"});
                }
            }
            group.timeEnd = submissionTime;
            await group.save();
            console.log(group)
            return res.status(200).json({submissionTimeChanged: true});
        }
    } catch (error) {
        console.log("editSubmissionTime module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}
