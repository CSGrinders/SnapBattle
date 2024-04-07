const Group = require("../../Models/Group");
const {User} = require("../../Models/User");

/**
 * Creates a getListUserPOints
 * /user/:userID/groups/:groupID/getListUserPoints
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
module.exports.getListUsersPoints = async(req, res)=> {
    try {
        const { groupID, userID} = req.params;

        const group = await Group.findById(groupID)
            .populate('userList.user')
        if (!group) {
            return res.status(404).json({errorMessage: 'Group could not be found.'})
        }

        const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
        if (!isUserInGroup) {
            return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
        }

        const userList = group.userList.map(list => ({
            _id: list.user._id,
            name: list.user.name,
            username: list.user.username,
            profilePicture: list.user.profilePicture,
            points: list.points,
        }));
        return res.status(200).json({list: userList})
    } catch (error) {
        console.log("getListUsersPoints module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


module.exports.addPoints = async(req, res)=> {
    try {
        const { groupID, userID, userToAdd } = req.params;
        const {pointsToAdd} = req.body;

        console.log(req.params)
        const findUser = await User.findOne({ username: userToAdd.toLowerCase() });

        if (!findUser) {
            return res.status(404).json({errorMessage: 'User not found.'})
        }

        const group = await Group.findById(groupID)
            .populate('userList', 'user.username points')
        if (!group) {
            return res.status(404).json({errorMessage: 'Group could not be found.'})
        }

        const userIndex = group.userList.findIndex(list => list.user._id.toString() === userID);
        if (userIndex === -1) {
            return res.status(401).json({ errorMessage: 'You don\'t belong to this group.' });
        }


        group.userList[userIndex].points += pointsToAdd;

        await group.save();
        return res.status(200).json({success: true})
    } catch (error) {
        console.log("addPoints module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

