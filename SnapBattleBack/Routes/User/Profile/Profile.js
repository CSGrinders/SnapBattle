const router = require("express").Router( { mergeParams: true });


const {uploadPhoto} = require("../../../Controllers/Profile/ProfileController")
const {signOut} = require("../../../Controllers/Auth/Auth");
const {getProfileInfo} = require("../../../Controllers/Profile/ProfileController")
const {deleteAccount} = require("../../../Controllers/Profile/PorfileSettings");


router.post('/upload-photo', uploadPhoto)
router.post('/signout', signOut)
router.get('/getProfileInfo', getProfileInfo)
router.post('/delete', deleteAccount)

module.exports = router