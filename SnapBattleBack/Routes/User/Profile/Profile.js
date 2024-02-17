const router = require("express").Router();


const {uploadPhoto} = require("../../../Controllers/Profile/ProfileController")

router.post('/upload-photo', uploadPhoto)

module.exports = router