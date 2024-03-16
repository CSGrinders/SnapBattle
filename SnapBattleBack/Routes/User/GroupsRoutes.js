/*
 * GroupRoutes.js
 *
 * This routing module manages all HTTP requests related to group functionalities.
 *
 * Routes:
 * - "/"
 * - "/create"
 * - "/list-users/:groupID"
 * - "/:groupID/invite"
 * - "/:groupID/groupname"
 * - "/:groupID/groupsize"
 * - "/:groupID/prompttime"
 * - "/:groupID/submissiontime"
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 * Note: before any group route, the path should include /user/:userid/
 */

const router = require("express").Router( { mergeParams: true });

const {
    inviteToGroup
} = require("../../Controllers/Groups/GroupInviteController");

const { getGroups, createGroup, listUsers, leaveGroup, deleteGroup, acceptGroupInvite, rejectGroupInvite, visitFriendProfile, checkAdmin, transferAdmin} = require("../../Controllers/Groups/GroupActionsController");
const { editGroupName, editGroupSize, editPromptTime, editSubmissionTime, editVotingLength } = require("../../Controllers/Groups/GroupSettingsController");
const { createPost } = require("../../Controllers/Groups/GroupPostController")
const {getChat} = require("../../Controllers/Groups/GroupChatController");
const {getPrompt} = require("../../Controllers/Groups/GroupPromptController");

router.get('/', getGroups);
router.get("/:groupID/getChat", getChat)

router.post('/create', createGroup);

router.get('/list-users/:groupID', listUsers);

router.post('/:groupID/invite', inviteToGroup);

router.post('/:groupID/groupname', editGroupName)

router.post('/:groupID/groupsize', editGroupSize)

router.post('/:groupID/prompttime', editPromptTime)

router.post('/:groupID/submissiontime', editSubmissionTime)

router.post('/:groupID/votingLength', editVotingLength)

router.post('/:groupID/acceptInvite', acceptGroupInvite, getGroups)

router.post('/:groupID/rejectInvite', rejectGroupInvite, getGroups)

router.post('/:groupID/leave-group', leaveGroup, getGroups)

router.post('/:groupID/delete-group', deleteGroup)

router.post('/:groupID/visit-member-profile', visitFriendProfile)

router.post('/:groupID/checkadmin', checkAdmin)

router.post('/:groupID/transfer-admin', transferAdmin)

router.get('/:groupID/get-prompt', getPrompt)

router.post("/:groupID/post", createPost)




module.exports = router;