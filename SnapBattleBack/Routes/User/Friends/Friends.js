const {searchUser, sendFriendRequest, getFriendRequests, getFriends, acceptFriendRequest, denyFriendRequest} = require("../../../Controllers/Friends/FriendsController");
const router = require("express").Router( { mergeParams: true });

router.get("/search/:searchUsername", searchUser)
router.post("/send-request", sendFriendRequest)
router.get("/get-requests", getFriendRequests)
router.get("/get-friends", getFriends)
router.post("/accept", acceptFriendRequest)
router.post("/deny", denyFriendRequest)

module.exports = router