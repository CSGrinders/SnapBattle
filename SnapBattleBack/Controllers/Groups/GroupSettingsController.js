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
const {sendGroups} = require("../../ServerSocketControllers/GroupHomeSocket");
const {populateAndSendGroups} = require("./GroupActionsController");
const {User} = require("../../Models/User");

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
            const users = group.userList;
            group.name = groupName;
            await group.save();

            for (let i = 0; i < users.length; i++) {
                let result = await User.aggregate([
                    {
                        $match: {_id: users[i]} // Make sure users[i] is correctly formatted as ObjectId
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
                console.log(result);
                if (result && result.length > 0) {
                    let groupsInfo = [];
                    result[0].groupInfo.forEach(group => {
                        groupsInfo.push({
                            groupID: group.groupID.toString(),
                            name: group.name,
                        });
                    });
                    sendGroups(users[i].toString(), { groups: groupsInfo })
                }
            }

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
            if (group.userList.length > groupSize) {
                return res.status(400).json({errorMessage: "Current member count exceeds maximum group users."})
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
            let newMin = parseInt(promptTime.substring(3));
            let subMin = parseInt(submissionTime.substring(3));
            if (newHr > subHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
            } else if (newHr === subHr) {
                if (newMin > subMin) {
                    return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
                }
            }
            let lengthHr = parseInt(group.timeToVote.substring(0, 2))
            let totalVotingMin = (parseInt(group.timeToVote.substring(3)) + lengthHr * 60) * 2;
            console.log(totalVotingMin)

            let hrsUsed = subHr - newHr
            let minUsed = subMin - newMin + (hrsUsed * 60)
            let minAvailable = 60 * 24 - minUsed
            console.log(minAvailable)

            if (minAvailable - totalVotingMin < 0) {
                return res.status(402).json({errorMessage: "Shorten voting length or push back prompt time."})
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
            let newMin = parseInt(submissionTime.substring(3));
            let startMin = parseInt(promptTime.substring(3));
            if (newHr < startHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"});
            } else if (newHr === startHr) {
                if (newMin > startMin) {
                    return res.status(400).json({errorMessage: "Submission time cannot start before prompt time!"});
                }
            }
            let lengthHr = parseInt(group.timeToVote.substring(0, 2))
            let totalVotingMin = (parseInt(group.timeToVote.substring(3)) + lengthHr * 60) * 2;

            let hrsUsed = newHr - startHr
            let minUsed = newMin - startMin + (hrsUsed * 60)
            let minAvailable = 60 * 24 - minUsed

            if (minAvailable - totalVotingMin < 0) {
                return res.status(402).json({errorMessage: "Shorten voting length or push forward submission time."})
            }

            group.timeEnd = submissionTime;
            await group.save();
            return res.status(200).json({submissionTimeChanged: true});
        }
    } catch (error) {
        console.log("editSubmissionTime module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

module.exports.editVotingLength = async (req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {votingLength} = req.body;
        const group = await Group.findById(groupID);


        if (group) {

            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"});
            }

            //convert voting time to minutes, multiply by 2 b/c of 2 voting periods
            const votingHours = parseInt(votingLength.substring(0, 2))
            console.log("voting hours: ", votingHours)
            const votingMin = parseInt(votingLength.substring(3))
            console.log("voting minutes: ", votingMin)
            const totalVotingMin = 2 * (votingHours * 60 + votingMin)

            //calculate minutes available after the prompt to submission time
            const startTime = group.timeStart
            const endTime = group.timeEnd
            const startHours = parseInt(startTime.substring(0, 2));
            const startMin = parseInt(startTime.substring(3));
            const endHours = parseInt(endTime.substring(0, 2))
            const endMin = parseInt(endTime.substring(3))
            let hrsUsed = endHours - startHours
            let minUsed = endMin - startMin + (hrsUsed * 60)
            let minAvailable = 60 * 24 - minUsed

            if (minAvailable - totalVotingMin < 0) {
                return res.status(400).json({errorMessage: "Not enough time in the day"})
            }

            group.votingLength = votingLength
            await group.save()
            return res.status(200).json({votingLengthChanged: true})

        }
    } catch (error) {
        console.log("editVotingLength module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}
