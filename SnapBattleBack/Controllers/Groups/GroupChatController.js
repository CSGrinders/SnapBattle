
const {User} = require("../../Models/User");
const Group = require('../../Models/Group');


/**
 *             {
 *                 _id: 11,
 *                 text: 'Test reply ^',
 *                 createdAt: new Date(),
 *                 user: {
 *                     _id: userID,
 *                     name: username,
 *                     avatar: getProfileImageCache(),
 *                 },
 *                 replyMessage: {
 *                     _id: 10,
 *                     name: username,
 *                     text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
 *                 },
 *             },
 *
 *
 *
 */


/**
 * desc
 * /user/:userID/groups/:groupID/getChat
 *
 * @params userID
 *
 */

module.exports.getChat = async(req, res)=> {
    try {
        const groupID = req.params.groupID;
        const groupChat = await Group.findById(groupID).populate('messages')
            .populate({
                path: 'messages',
        });

        if (!groupChat) { //Group not found
            console.log("NULL?");
            return res.status(500).json({errorMessage: "Something went wrong..."});
        }
        const messages = groupChat.messages;
        if (!messages || messages.length === 0) {
            console.log("empty")
            return res.status(200).json({isEmpty: true});
        }
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


        return res.status(200).json({ isEmpty: false, messages: messages });
    } catch (error) {
        console.log("getMessages module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}