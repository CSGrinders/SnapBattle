const router = require("express").Router({ mergeParams: true });


const {uploadPhoto} = require("../../../Controllers/Profile/ProfileController")
const {signOut} = require("../../../Controllers/Auth/Auth");

router.post('/upload-photo', uploadPhoto)
router.post('/signout', signOut)

module.exports = router