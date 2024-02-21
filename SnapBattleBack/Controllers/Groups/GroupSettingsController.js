const {Group} = require('../../Models/Group.js')

/**
 * /user/:userID/groups/:groupID/editGroupName
 * @params groupID, groupName
 *
 * @returns 200 for success, 401 for authentication error, 404 for not found, 500 for server errs
 */

module.exports.editGroupName = async(req, res) => {
    try {
        const userID = req.params.userID;
        const groupID = req.params.groupID;
        const groupName = req.body.groupName;

        const group = await Group.findById(groupID);
        if (group) {
            if (group.adminUserID.toString() === userID) {
                res.status(401).json({errorMessage: "You are not an administrator!"})
            }
            group.name = groupName;
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