const router = require("express").Router();


const {uploadPhoto} = require("../../../Controllers/Profile/ProfileController")

router.get('/upload-photo', uploadPhoto)

module.exports = router