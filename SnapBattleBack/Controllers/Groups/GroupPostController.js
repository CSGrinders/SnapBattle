const {
    ref,
    uploadBytesResumable,
    getDownloadURL
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase");
const {User} = require("../../Models/User");
const sharp = require('sharp');

module.exports.createPost = async(req, res) => {
    const {userID, groupID} = req.params
    const {base64} = req.body

    try {
        //compress the image by sharp
        const buffer = Buffer.from(base64, 'base64');
        const compressedBuffer = await sharp(buffer).resize({ width: 600, height: 600 }).jpeg({ quality: 20 }).toBuffer();
        const blob = new Blob([compressedBuffer], { type: 'image/jpeg' });

        const day = new Date().getDay()

        const fileLocation = `${groupID}/${day}/${userID}.jpeg`

        const imageRef = ref(storage, fileLocation);
        await uploadBytesResumable(imageRef, blob)

        //save the downloadable url to MongoDB


        /*
        const user = await User.findById(userID)
        user.profilePicture = await getDownloadURL(imageRef)
        await user.save()

        return res.status(200).json({status: "Image uploaded successfully."});

         */

    } catch (error) {
        console.log("createPost module: " + error);
        res.status(500).json({errorMessage: "Something went wrong..."});
    }
}