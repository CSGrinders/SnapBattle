const {
    ref,
    uploadBytesResumable,
    getDownloadURL
} = require("firebase/storage");

const storage = require("../../Firebase/Firebase");
const {User} = require("../../Models/User");
const Group = require("../../Models/Group")
const {Post, Comment} = require('../../Models/Post')
const sharp = require('sharp');

module.exports.createPost = async(req, res) => {
    const {userID, groupID} = req.params
    const {base64} = req.body

    try {
        //compress the image by sharp
        const buffer = Buffer.from(base64, 'base64');
        const compressedBuffer = await sharp(buffer).rotate().resize({ width: 400, height: 480 }).jpeg({ quality: 20 }).toBuffer();
        const blob = new Blob([compressedBuffer], { type: 'image/jpeg' });

        //current time
        const now = new Date()

        //save the downloadable url to MongoDB in corresponding prompt
        const group = await Group.findById(groupID).populate({path: 'prompts', populate: {path: 'posts'}})

        if (!group) {
            return res.status(404).json({errorMessage: 'Group could not be found.'})
        }

        const isUserInGroup = group.userList.some(list => list.user._id.toString() === userID);
        if (!isUserInGroup) {
            return res.status(401).json({errorMessage: 'You don\'t belong to this group.'});
        }

        const prompts = group.prompts
        for (let i = 0; i < prompts.length; i++) {

            //prompt was found
            if (prompts[i].timeEnd.getDay() === now.getDay() && prompts[i].timeEnd.getMonth() === now.getMonth()) {

                //check if the user has already submitted to the prompt
                const posts = prompts[i].posts
                let nextSubmissionNum = 1
                let existingPost = null
                for (let j = 0; j < posts.length; j++) {
                    if (posts[j].owner.toString() === userID) {
                        existingPost = posts[j]
                        nextSubmissionNum = posts[j].submissionNumber + 1
                    }
                }

                //user already submitted 3 times
                if (nextSubmissionNum > 3) {
                    return res.status(401).json({errorMessage: "Already submitted 3 times."})
                }

                //upload photo to firebase
                const fileLocation = `${groupID}/${now.getMonth()}/${now.getDate()}/${userID}.jpeg`
                const imageRef = ref(storage, fileLocation);
                await uploadBytesResumable(imageRef, blob)
                const downloadURL = await getDownloadURL(imageRef)


                //user has already submitted once -> need to replace existing post
                if (existingPost !== null) {
                    existingPost.picture = downloadURL
                    existingPost.submissionNumber = nextSubmissionNum
                    existingPost.likes = 0
                    //delete all the comments on the existing post
                    for (let j = 0; j < existingPost.comments.length; j++) {
                        await Comment.findByIdAndDelete(existingPost.comments[j])
                    }
                    existingPost.comments = []
                    existingPost.time = now

                    await existingPost.save()

                }

                //user has not submitted -> need to create a new post
                else {
                    //create new MongoDB document
                    let newPost = new Post({
                        prompt: prompts[i]._id.toString(),
                        picture: downloadURL,
                        owner: userID,
                        submissionNumber: nextSubmissionNum,
                        time: now
                    })
                    await newPost.save()

                    //save it under the corresponding prompt
                    prompts[i].posts.push(newPost._id)
                }

                await prompts[i].save()
                return res.status(200).json()
            }
        }

        //no prompt was found
        return res.status(404).json({errorMessage: "Prompt could not be found."})

    } catch (error) {
        console.log("createPost module: " + error);
        return res.status(500).json({errorMessage: "Something went wrong..."});
    }
}