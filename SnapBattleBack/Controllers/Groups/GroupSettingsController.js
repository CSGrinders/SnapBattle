const Group = require('../../Models/Group')

/**
 * /user/:userID/groups/:groupID/groupName
 * @params groupID, groupName
 *
 * @returns 200 for success, 401 for authentication error, 404 for not found, 500 for server errs
 */

module.exports.editGroupName = async(req, res) => {
    try {
        console.log("what")
        const {userID, groupID} = req.params;
        const groupName = req.body;
        console.log("groupid: " + groupID.toString())
        console.log("groupName: " + groupName.toString())
        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() === userID) {
                res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            group.name = groupName;x
            console.log(groupName);
            await group.save();
            res.status(200).json({nameChange: true})
        }
        else {
            res.status(404).json({errorMessage: "Group not found"})
        }
    } catch (error) {
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}