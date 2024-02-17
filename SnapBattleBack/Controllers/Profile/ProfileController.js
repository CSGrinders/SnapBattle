const {
    ref,
    uploadBytes,
    uploadBytesResumable
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase")

const multer = require('multer');
const upload = multer();


module.exports.uploadPhoto = async(req, res)=> {
    try {
        console.log("what")
        const userID = req.body.userID;
        const blob2 = req.body.blob;
        console.log(blob2)

        const fileName = userID + "idk";
        const imageRef = ref(storage, `profileImage/${fileName}`);
        await uploadBytesResumable(imageRef, blob2);

        // const storageRef = storage.ref().child("/")
        // storageRef.put(blob)

        return res.status(200).json('Image uploaded successfully.');
    } catch (error) {
        return res.status(400).json('Error uploading image: ' + error.message);
    }
}