/*
 * ProfileController.js
 *
 * This controller handles user profile operations.
 *
 * Functionalities:
 * - UploadPhoto: Allows users to upload a profile photo.
 * - GetPhoto: Gets the URL of a user's profile photo from Firebase.
 * - GetProfileInfo: Fetches and returns user profile information,
 * including username, bio, achievements, and the profile picture URL.
 * - FindUser: ?
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase");
const {User} = require("../../Models/User");
const sharp = require('sharp');

/**
 * add desc
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 */

module.exports.uploadPhoto = async(req, res)=> {
    try {
        const base64data = req.body.base64data;
        const userID = req.params.userID;
        const buffer = Buffer.from(base64data, 'base64');

        //compress the image by sharp
        const compressedBuffer = await sharp(buffer).resize({ width: 600, height: 600 }).jpeg({ quality: 1 }).toBuffer();

        const blob = new Blob([compressedBuffer], { type: 'image/jpeg' });

        const fileName = userID + ".jpeg";
        const imageRef = ref(storage, `profileImage/${fileName}`);
        await uploadBytesResumable(imageRef, blob)

        //save the downloadable url to MongoDB
        const user = await User.findById(userID)
        user.profilePicture = await getDownloadURL(imageRef)
        await user.save()

        return res.status(200).json({status: "Image uploaded successfully."});
    } catch (error) {
        console.log("uploadPhoto module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * add desc
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 */
module.exports.getPhoto = async(req, res)=> {
    try {
        const userID = req.params.userID;
        const imageRef = ref(storage, `profileImage/${userID}.jpeg`);
        getDownloadURL(imageRef)
            .then((url) => {
                console.log("getPhoto module: " + url);
                return res.status(200).json({url: url});
            })
            .catch((error) => {
                console.log("getPhoto module: " + error);
                res.status(500).json({errorMessage: "Something went wrong..."});
            });
    } catch (error) {
        console.log("getPhoto module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}

/**
 * add desc
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 */

module.exports.getProfileInfo = async (req, res) => {
    try {
        const {userID} = req.params;
        const findUser = await User.findById(userID);
        if (findUser) {
            const name = findUser.name
            const bio = findUser.biography;
            const achievements = findUser.numWins;
            const profilePicture = findUser.profilePicture;
            const username = findUser.username;

            return res.status(200).json({
                name: name,
                username: username,
                profilePicture: profilePicture,
                bio: bio,
                achievements: achievements
            });
        } else {
            return res.status(404).json({errorMessage: "User could not be found."});
        }
    } catch (error) {
        console.log("getProfileInfo module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}


/**
 * add desc
 * route
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 */

module.exports.findUser = async(req, res) => {
    console.log("findUser module: request received");
}