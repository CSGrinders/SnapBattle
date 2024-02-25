const Group = require('../../Models/Group')

/**
 * /user/:userID/groups/:groupID/groupName
 * @params groupName
 *
 * @returns 200 for success, 400 for invalid input,
 * 401 for authentication error, 404 for not found, 500 for server errs
 */

module.exports.editGroupName = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {groupName} = req.body;
        console.log("groupID: " + groupID)
        console.log("groupName: " + groupName)
        if (groupName.length < 3 || groupName.length > 20) {
            return res.status(400).json({errorMessage: "Invalid name length! (3-20 chars)."})
        }
        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            group.name = groupName;
            await group.save();
            console.log(group)
            return res.status(200).json({nameChange: true})
        }
        else {
            return res.status(404).json({errorMessage: "Group not found"})
        }
    } catch (error) {
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * /user/:userID/groups/:groupID/groupsize
 * @params groupSize
 *
 * @returns 200 for success, 400 for invalid input,
 * 401 for authentication error, 404 for not found, 500 for server errs
 */

module.exports.editGroupSize = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {groupSize} = req.body;
        if (groupSize > 51) {
            return res.status(400).json({errorMessage: "Group size must be less than 50!"})
        }
        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            group.maxUsers = groupSize;
            await group.save();
            console.log(group)
            return res.status(200).json({sizeChange: true})
        }
    } catch (error) {
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * /user/:userID/groups/:groupID/prompttime
 * @params promptTime
 *
 * @returns 200 for success, 400 for invalid input,
 * 401 for authentication error, 404 for not found, 500 for server errs
 */
module.exports.editPromptTime = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {promptTime} = req.body;
        const group = await Group.findById(groupID);
        if (group) {
            let submissionTime = group.timeEnd;
            console.log(submissionTime)
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            // check if prompt time isn't before submission time
            let newHr = parseInt(promptTime.substring(0, 2))
            let subHr = parseInt(submissionTime.substring(0,2))
            if (newHr > subHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"})
            } else if (newHr === subHr) {
                let newMin = parseInt(promptTime.substring(3))
                let subMin = parseInt(submissionTime.substring(3))
                if (newMin > subMin) {
                    return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"})
                }
            }
            group.timeStart = promptTime;
            await group.save();
            console.log(group)
            return res.status(200).json({promptTimeChange: true})
        }
    } catch (error) {
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * /user/:userID/groups/:groupID/submissiontime
 * @params submissionTime
 *
 * @returns 200 for success, 400 for invalid input,
 * 401 for authentication error, 404 for not found, 500 for server errs
 */
module.exports.editSubmissionTime = async(req, res) => {
    try {
        const {userID, groupID} = req.params;
        const {submissionTime} = req.body;
        const group = await Group.findById(groupID);
        if (group) {
            let promptTime = group.timeStart;
            console.log(promptTime)
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            // check if prompt time isn't before submission time
            let newHr = parseInt(submissionTime.substring(0, 2))
            let startHr = parseInt(promptTime.substring(0,2))
            if (newHr < startHr) {
                return res.status(400).json({errorMessage: "Prompt time cannot start before submission time!"})
            } else if (newHr === startHr) {
                let newMin = parseInt(submissionTime.substring(3))
                let startMin = parseInt(promptTime.substring(3))
                if (newMin > startMin) {
                    return res.status(400).json({errorMessage: "Submission time cannot start before prompt time!"})
                }
            }
            group.timeEnd = submissionTime;
            await group.save();
            console.log(group)
            return res.status(200).json({submissionTimeChange: true})
        }
    } catch (error) {
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}
