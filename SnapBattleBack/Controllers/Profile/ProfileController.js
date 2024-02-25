const {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase")
const {User} = require("../../Models/User");


module.exports.uploadPhoto = async(req, res)=> {
    try {

        const base64data = req.body.base64data;
        const userID = req.params.userID;
        const buffer = Buffer.from(base64data, 'base64');
        const blob = new Blob([buffer], { type: 'image/jpeg' })

        const fileName = userID + ".jpeg";
        const imageRef = ref(storage, `profileImage/${fileName}`);
        uploadBytesResumable(imageRef, blob).then(() => {
            return res.status(200).json('Image uploaded successfully.');
        })
        // const storageRef = storage.ref().child("/")
        // storageRef.put(blob)

    } catch (error) {
        return res.status(400).json('Error uploading image: ' + error.message);
    }
}

module.exports.getPhoto = async(req, res)=> {
    try {
        const userID = req.params.userID;
        const imageRef = ref(storage, `profileImage/${userID}.jpeg`);
        getDownloadURL(imageRef)
            .then((url) => {
                console.log('Image URL:', url);
                return res.status(200).json({url: url});
            })
            .catch((error) => {
                console.error('Error downloading image:', error);
            });
    } catch (error) {
        return res.status(400).json('Error getting image: ' + error.message);
    }
}

module.exports.getProfileInfo = async (req, res) => {
    try {
        const {userID} = req.params
        console.log(userID);
        const findUser = await User.findById(userID)
        if (findUser) {
            const bio = findUser.biography;
            const achievements = findUser.numWins;
            const profilePicture = findUser.profilePicture;
            const username = findUser.username;

            return res.status(200).json({username: username, profilePicture: profilePicture, bio: bio, achievements: achievements});
        } else {
            return res.status(404).json({errorMessage: "User could not be found"});
        }
    } catch {
        return res.status(500).json({errorMessage: "Internal server error"});
    }
}

module.exports.findUser = async(req, res) => {
    console.log("request received")
}