const {
    ref,
    uploadBytesResumable,
    getDownloadURL
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase");
const {User} = require("../../Models/User");
const Group = require("../../Models/Group")
const {Post} = require('../../Models/Post')
const sharp = require('sharp');

module.exports.createPost = async(req, res) => {
    const {userID, groupID} = req.params
    const {base64} = req.body

    try {
        //compress the image by sharp
        const buffer = Buffer.from(base64, 'base64');
        const compressedBuffer = await sharp(buffer).resize({ width: 600, height: 600 }).jpeg({ quality: 20 }).toBuffer();
        const blob = new Blob([compressedBuffer], { type: 'image/jpeg' });

        //current time
        const now = new Date()
        console.log(now)
        console.log(now.getMonth())

        //upload photo to firebase
        const fileLocation = `${groupID}/${now.getMonth()}/${now.getDate()}/${userID}.jpeg`
        const imageRef = ref(storage, fileLocation);
        await uploadBytesResumable(imageRef, blob)


        //save the downloadable url to MongoDB in corresponding prompt
        const group = await Group.findById(groupID).populate('prompts')
        const prompts = group.prompts
        for (let i = 0; i < prompts.length; i++) {
            if (prompts[i].timeEnd.getDay() === now.getDay() && prompts[i].timeEnd.getMonth() === now.getMonth()) {
                const downloadURL = await getDownloadURL(imageRef)
                //create new MongoDB document
                let newPost = new Post({
                    pID: prompts[i]._id,
                    picture: downloadURL
                })
                await newPost.save()

                //save it under the corresponding prompt
                prompts[i].posts.push(newPost._id)
                await prompts[i].save()
            }
        }

        //no prompt was found
        return res.status(404).json({errorMessage: "prompt could not be found"})

    } catch (error) {
        console.log("createPost module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}