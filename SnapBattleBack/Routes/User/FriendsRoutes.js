/*
 * FriendsRoutes.js
 *
 * This routing module handles all HTTP requests related to friends.
 *
 * Routes:
 * - "/search/:searchUsername"
 * - "/send-request"
 * - "/get-requests"
 * - "/get-friends"
 * - "/accept"
 * - "/deny"
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 * Note: before any friend route, the path should include /user/:userid/
 */

const {searchUser, sendFriendRequest, getFriendRequests, getFriends, acceptFriendRequest, denyFriendRequest, removeFriend,
    getFriendsAndRequests,
    removeRequest, unblock, getBlockedUsers, blockUser, removeFriendBlock
} = require("../../Controllers/Friends/FriendsController");
const {leaveAllGroups} = require("../../Controllers/Groups/GroupActionsController");
const router = require("express").Router( { mergeParams: true });

router.get("/search/:searchUsername", searchUser);
router.post("/send-request", sendFriendRequest);
router.get("/get-friends", getFriendsAndRequests);
router.get("/get-blocked", getBlockedUsers);
router.post("/accept", acceptFriendRequest);
router.post("/deny", denyFriendRequest);
router.post("/remove", removeFriend);
router.post("/remove-request", removeRequest);
router.post("/unblock", unblock);
router.post("/block", removeFriendBlock, blockUser, leaveAllGroups);

module.exports = router;