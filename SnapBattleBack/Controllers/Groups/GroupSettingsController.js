const Group = require('../../Models/Group')

/**
 * /user/:userID/groups/:groupID/groupName
 * @params groupID, groupName
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
        console.log(group)
        if (group) {
            if (group.adminUserID.toString() !== userID) {
                return res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            group.name = groupName;
            await group.save();
            return res.status(200).json({nameChange: true})
        }
        else {
            return res.status(404).json({errorMessage: "Group not found"})
        }
    } catch (error) {
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

