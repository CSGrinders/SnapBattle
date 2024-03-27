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

const { getGroups, createGroup, listUsers, leaveGroup, deleteGroup,
    acceptGroupInvite, rejectGroupInvite, visitFriendProfile,
    checkAdmin, transferAdmin, kickUser, leaveAllGroups,
} = require("../../Controllers/Groups/GroupActionsController");
const { editGroupName, editGroupSize, editPromptTime, editSubmissionTime, editVotingLength } = require("../../Controllers/Groups/GroupSettingsController");
const { createPost } = require("../../Controllers/Groups/GroupPostController")
const {getChat} = require("../../Controllers/Groups/GroupChatController");
const {getPrompt} = require("../../Controllers/Groups/GroupPromptController");
const { viewComments, viewReplies, commentsEnabled, postComment, deleteComment, editComment} = require("../../Controllers/Posts/CommentController");

router.get('/', getGroups);
router.get("/:groupID/getChat", getChat)

router.post('/create', createGroup)

router.post('/block', leaveAllGroups)

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

router.post('/:groupID/kick-user', kickUser)

router.get('/:groupID/get-prompt', getPrompt)

router.post("/:groupID/post", createPost)

router.get('/:groupID/view-comments/:postID', viewComments)

router.get('/:groupID/comments-allowed/:postID', commentsEnabled)

router.post('/:groupID/create-comment/:postID', postComment)

router.delete('/:groupID/delete-comment/:postID/:commentID', deleteComment)

router.post('/:groupID/edit-comment/:postID', editComment)

router.get('/:groupID/view-replies/:postID/:commentID', viewReplies)

module.exports = router;