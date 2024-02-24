/**
 * Handle user logout.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const {User, Session} = require("../../Models/User");
const {compare} = require("bcrypt");


/**
 * Handle user change password.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changePassword = async(req, res)=> {
    try {
        const {userID} = req.params;
        const {newPassword} = req.body;

        if (newPassword === '') {
            return res.status(400).json({
                errorMessage: "Invalid password length. Max (4-20 Chars).",
            });
        }
        if (newPassword.length < 4 || newPassword.length > 20) {
            return res.status(400).json({
                errorMessage: "Invalid password length. Max (4-20 Chars).",
            });
        }


        const user = await User.findById(userID); //find user
        if (user) {
            // Compares password given by client and decrypted password stored in MongoDB
            const verifyPassword = await compare(newPassword, user.password);
            if (verifyPassword) {
                return res.status(401).json({
                    errorMessage: "The new password should be different.",
                });
            }
            user.password = newPassword;
            await user.save();
            res.status(200).json({passChanged: true});
        } else {
            res.status(500).json({
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


/**
 * Handle user change name.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changeName = async(req, res)=> {
    try {
        const { userID } = req.params;
        const { newName } = req.body;

        if (newName === '') { //Empty field
            res.status(400).json({
                errorMessage: "Field empty.",
            });
        }

        if (newName.length < 2 || newName.length > 10) { //invalid name length
            return res.status(400).json({
                errorMessage: "Invalid name length. Max (2-15 Chars).",
            });
        }

        const user = await User.findById(userID); //find user
        console.log(user);
        if (user) { //User found
            user.name = newName;
            await user.save();
            console.log(user);
            res.status(200).json({nameChanged: true});
        } else { //user not found
            res.status(400).json({
                errorMessage: "Something went wrong...",
            });
        }

    } catch (error) { //Server error
        console.log(error);
        res.status(500).json({
            errorMessage: "Something went wrong...",
        });
    }
}


/**
 * Handle user change bio.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.changeBio = async(req, res)=> {
    try {
        const { userID } = req.params;
        const { newBio } = req.body;

        if (newBio === '') { //Empty field
            res.status(400).json({
                errorMessage: "Field empty.",
            });
        }

        if (newBio.length > 30) { // Check length
            return res.status(400).json({
                errorMessage: "Invalid biography length. Max (30 Chars).",
            });
        }

        const user = await  User.findById(userID); //Find user
        if (user) { //User not found
            if (user.biography === newBio) { //Check if it is the same bio
                return res.status(400).json({
                    errorMessage: "The new biography should be different.",
                });
            }
            user.biography = newBio;
            await user.save();
            res.status(200).json({bioChanged: true});
        } else { //User not found send error
            res.status(400).json({
                errorMessage: "Something went wrong...",
            });
        }

    } catch (error) { //Server error
        console.log(error);
        res.status(500).json({
            errorMessage: "Something went wrong...",
        });
    }
}


/**
 * Handle user delete Account.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.deleteAccount = async(req, res)=> {
    try {
        const { userID } = req.params;
        const user = await User.findById(userID); //Find user
        if (user) {
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