/**
 * Handle user logout.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const {User, Session} = require("../../Models/User");

module.exports.changePassword = async(req, res)=> {}
module.exports.changeName = async(req, res)=> {}
module.exports.changeBio = async(req, res)=> {}


module.exports.deleteAccount = async(req, res)=> {
    try {
        const { userID } = req.params;
        console.log(userID)
        const user = await User.findById(userID); //Find user
        console.log(user)
        if (user) {
            console.log(user)
            await User.deleteOne(user);
            const session = await Session.findOne({ userID: userID}); //Find session
            await session.deleteOne(session);
            res.status(200).json({isDeleted: true});
        } else {
            res.status(400).json({
                errorMessage: "Something went wrong...",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errorMessage: "Something went wrong...",
        });
    }
}