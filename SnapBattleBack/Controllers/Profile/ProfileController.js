const {
    ref,
    uploadBytes,
    uploadBytesResumable
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase")


module.exports.uploadPhoto = async(req, res)=> {
    try {

        const base64data = req.body.base64data;
        const userID = req.body.userID;
        const buffer = Buffer.from(base64data, 'base64');
        const blob = new Blob([buffer], { type: 'image/jpeg' })

        const fileName = userID + ".jpeg";
        const imageRef = ref(storage, `profileImage/${fileName}`);
        await uploadBytesResumable(imageRef, blob);

        // const storageRef = storage.ref().child("/")
        // storageRef.put(blob)

        return res.status(200).json('Image uploaded successfully.');
    } catch (error) {
        return res.status(400).json('Error uploading image: ' + error.message);
    }
}