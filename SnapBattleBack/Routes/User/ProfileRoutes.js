/*
 * Profile.js
 *
 * This routing module handles all profile actions for users.
 *
 * Routes:
 * - "/upload-photo"
 * - "/signout"
 * - "/getProfileInfo"
 * - "/get-photo"
 * - "/delete"
 * - "/changename"
 * - "/changebio"
 * - "/changepassword"
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 * Note: before any profile route, the path should include /user/:userid/
 */

const router = require("express").Router( { mergeParams: true });


const {uploadPhoto, getAchievements} = require("../../Controllers/Profile/ProfileController");
const {getPhoto} = require("../../Controllers/Profile/ProfileController");
const {signOut} = require("../../Controllers/Auth/AuthController");
const {getProfileInfo} = require("../../Controllers/Profile/ProfileController");
const {deleteAccount, changeName, changeBio, changePassword} = require("../../Controllers/Profile/ProfileSettingsController");

router.post('/upload-photo', uploadPhoto)
router.post('/signout', signOut)
router.get('/getProfileInfo', getProfileInfo)
router.get('/get-photo', getPhoto)
router.post('/delete', deleteAccount)
router.post('/changename', changeName)
router.post('/changebio', changeBio);
router.post('/changepassword', changePassword);
router.get('/get-achievements/:searchID', getAchievements)

module.exports = router