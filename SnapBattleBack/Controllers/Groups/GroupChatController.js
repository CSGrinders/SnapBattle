
const {User} = require("../../Models/User");
const Group = require('../../Models/Group');




/**
 * desc
 * /user/:userID/groups/:groupID/getChat
 *
 * @params userID
 *
 */

module.exports.getChat = async(req, res)=> {
    try {
        const { groupID, userID} = req.params;
        const groupChat = await Group.findById(groupID).populate('messages')
            .populate({
                path: 'messages',
        }).populate('userList.user', '_id');

        const isUserInGroup = groupChat.userList.some(list => list.user._id.toString() === userID);
        if (!isUserInGroup) {
            return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
        }


        if (!groupChat) { //Group not found
            return res.status(500).json({errorMessage: "Something went wrong..."});
        }
        const messages = groupChat.messages;
        if (!messages || messages.length === 0) {
            return res.status(200).json({isEmpty: true});
        }
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


        return res.status(200).json({ isEmpty: false, messages: messages });
    } catch (error) {
        console.log("getMessages module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}